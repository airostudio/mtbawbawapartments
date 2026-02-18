/**
 * Availability service - manages property availability checks and caching
 */

import { ConnectorFactory, DateRange, AvailabilityResult } from '@/lib/connectors';
import { query, queryOne, generateId } from '@/lib/db';
import type { Property, AvailabilityCacheRow } from '@/lib/db/types';
import { env } from '@/lib/utils/env';

/**
 * A single seasonal pricing rule stored in property.seasonalMarkup JSON.
 *
 * Uses month/day (1-indexed) so rules repeat every year automatically.
 * Wrap-around seasons (e.g. Christmas Dec 20 → Jan 10) are supported:
 * just set startMonth > endMonth and the service handles the rollover.
 *
 * Example seasonalMarkup JSON:
 * {
 *   "seasons": [
 *     { "name": "Ski Season",    "markup": 35, "startMonth": 6,  "startDay": 1,  "endMonth": 8,  "endDay": 31 },
 *     { "name": "Christmas/NYE", "markup": 40, "startMonth": 12, "startDay": 20, "endMonth": 1,  "endDay": 10 },
 *     { "name": "Easter",        "markup": 25, "startMonth": 4,  "startDay": 1,  "endMonth": 4,  "endDay": 22 }
 *   ]
 * }
 */
interface SeasonRule {
  name: string;
  markup: number; // Percentage, e.g. 35 means 35%
  startMonth: number; // 1-12
  startDay: number;   // 1-31
  endMonth: number;   // 1-12
  endDay: number;     // 1-31
}

interface SeasonalMarkupConfig {
  seasons: SeasonRule[];
}

/**
 * Determine the highest seasonal markup that applies to any night in the stay.
 * Returns the property's base markupPercent if no season matches.
 */
function resolveSeasonalMarkup(
  checkIn: Date,
  checkOut: Date,
  baseMarkupPercent: number,
  seasonalMarkup: unknown
): number {
  if (!seasonalMarkup || typeof seasonalMarkup !== 'object') {
    return baseMarkupPercent;
  }

  const config = seasonalMarkup as SeasonalMarkupConfig;
  if (!Array.isArray(config.seasons) || config.seasons.length === 0) {
    return baseMarkupPercent;
  }

  let highestMarkup = baseMarkupPercent;

  // Check each night of the stay against all season rules
  const cursor = new Date(checkIn);
  while (cursor < checkOut) {
    const month = cursor.getUTCMonth() + 1; // 1-12
    const day = cursor.getUTCDate();

    for (const season of config.seasons) {
      if (isDateInSeason(month, day, season)) {
        if (season.markup > highestMarkup) {
          highestMarkup = season.markup;
        }
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return highestMarkup;
}

/**
 * Check whether a given month/day falls within a season rule.
 * Handles wrap-around seasons (e.g. Dec 20 → Jan 10).
 */
function isDateInSeason(month: number, day: number, season: SeasonRule): boolean {
  // Encode as a comparable MMDD integer
  const dateMD = month * 100 + day;
  const startMD = season.startMonth * 100 + season.startDay;
  const endMD = season.endMonth * 100 + season.endDay;

  if (startMD <= endMD) {
    // Normal season: e.g. Jun 1 → Aug 31 (startMD=601, endMD=831)
    return dateMD >= startMD && dateMD <= endMD;
  } else {
    // Wrap-around season: e.g. Dec 20 → Jan 10 (startMD=1220, endMD=110)
    return dateMD >= startMD || dateMD <= endMD;
  }
}

export class AvailabilityService {
  /**
   * Check availability for a property
   */
  static async checkAvailability(
    propertyId: string,
    dateRange: DateRange
  ): Promise<AvailabilityResult & { priceWithMarkup?: number }> {
    // Fetch property with connector config
    const property = await queryOne<Property>(
      `SELECT * FROM "Property" WHERE "id" = $1`,
      [propertyId],
    );

    if (!property) {
      return {
        available: false,
        error: 'Property not found',
      };
    }

    if (!property.active) {
      return {
        available: false,
        error: 'Property not active',
      };
    }

    // Create connector and check availability
    const connector = ConnectorFactory.create({
      propertyId: property.id,
      connectorType: property.connectorType,
      connectorConfig: property.connectorConfig as Record<string, any> || {},
    });

    const result = await connector.checkAvailability(dateRange);

    // If available, calculate markup price with seasonal adjustment
    if (result.available) {
      const baseMarkup = property.markupPercent || env.DEFAULT_MARKUP_PERCENT;
      const markupPercent = resolveSeasonalMarkup(
        dateRange.checkIn,
        dateRange.checkOut,
        baseMarkup,
        property.seasonalMarkup
      );
      const price = result.price || property.basePrice;
      const priceWithMarkup = price * (1 + markupPercent / 100);

      return {
        ...result,
        price,
        priceWithMarkup,
      };
    }

    return result;
  }

  /**
   * Refresh availability cache for a property
   */
  static async refreshCache(propertyId: string, days: number = 90): Promise<void> {
    const property = await queryOne<Property>(
      `SELECT * FROM "Property" WHERE "id" = $1`,
      [propertyId],
    );

    if (!property) {
      throw new Error('Property not found');
    }

    const connector = ConnectorFactory.create({
      propertyId: property.id,
      connectorType: property.connectorType,
      connectorConfig: property.connectorConfig as Record<string, any> || {},
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const calendar = await connector.fetchCalendar(startDate, endDate);

    // Update cache in database
    const cacheEntries = [];
    for (const [dateStr, availability] of calendar.entries()) {
      cacheEntries.push({
        propertyId: property.id,
        date: new Date(dateStr),
        available: availability.available,
        price: availability.price || property.basePrice,
        lastFetch: new Date(),
      });
    }

    // Batch upsert
    for (const entry of cacheEntries) {
      await query(
        `INSERT INTO "AvailabilityCache" ("id", "propertyId", "date", "available", "price", "lastFetch")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("propertyId", "date") DO UPDATE
         SET "available" = EXCLUDED."available", "price" = EXCLUDED."price", "lastFetch" = EXCLUDED."lastFetch"`,
        [generateId(), entry.propertyId, entry.date, entry.available, entry.price, entry.lastFetch],
      );
    }
  }

  /**
   * Get cached availability for date range
   */
  static async getCachedAvailability(
    propertyId: string,
    dateRange: DateRange
  ): Promise<AvailabilityResult | null> {
    const nights = this.calculateNights(dateRange.checkIn, dateRange.checkOut);
    const dates: Date[] = [];

    for (let i = 0; i < nights; i++) {
      const date = new Date(dateRange.checkIn);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    const cached = await query<AvailabilityCacheRow>(
      `SELECT * FROM "AvailabilityCache" WHERE "propertyId" = $1 AND "date" = ANY($2::date[])`,
      [propertyId, dates],
    );

    // If we don't have complete cache, return null
    if (cached.length !== nights) {
      return null;
    }

    // Check cache age
    const cacheAge = Date.now() - cached[0].lastFetch.getTime();
    const cacheMaxAge = env.AVAILABILITY_CACHE_TTL * 60 * 1000;

    if (cacheAge > cacheMaxAge) {
      return null; // Cache too old
    }

    // Check if all nights are available
    const allAvailable = cached.every(day => day.available);

    if (!allAvailable) {
      return { available: false };
    }

    const avgPrice = cached.reduce((sum, day) => sum + (day.price || 0), 0) / nights;

    return {
      available: true,
      price: avgPrice,
    };
  }

  private static calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
