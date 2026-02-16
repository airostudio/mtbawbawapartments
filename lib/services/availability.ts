/**
 * Availability service - manages property availability checks and caching
 */

import { ConnectorFactory, DateRange, AvailabilityResult } from '@/lib/connectors';
import prisma from '@/lib/db';
import { env } from '@/lib/utils/env';

export class AvailabilityService {
  /**
   * Check availability for a property
   */
  static async checkAvailability(
    propertyId: string,
    dateRange: DateRange
  ): Promise<AvailabilityResult & { priceWithMarkup?: number }> {
    // Fetch property with connector config
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

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

    // If available, calculate markup price
    if (result.available && result.price) {
      const markupPercent = property.markupPercent || env.DEFAULT_MARKUP_PERCENT;
      const priceWithMarkup = result.price * (1 + markupPercent / 100);

      return {
        ...result,
        priceWithMarkup,
      };
    }

    return result;
  }

  /**
   * Refresh availability cache for a property
   */
  static async refreshCache(propertyId: string, days: number = 90): Promise<void> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

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
      await prisma.availabilityCache.upsert({
        where: {
          propertyId_date: {
            propertyId: entry.propertyId,
            date: entry.date,
          },
        },
        update: {
          available: entry.available,
          price: entry.price,
          lastFetch: entry.lastFetch,
        },
        create: entry,
      });
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

    const cached = await prisma.availabilityCache.findMany({
      where: {
        propertyId,
        date: { in: dates },
      },
    });

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
