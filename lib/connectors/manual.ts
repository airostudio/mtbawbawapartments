/**
 * Manual connector - for properties without automated availability
 * Relies on manual updates in the database
 */

import { BaseConnector, DateRange, AvailabilityResult, PropertyConfig } from './base';
import { query } from '@/lib/db';
import type { AvailabilityCacheRow } from '@/lib/db/types';

export class ManualConnector extends BaseConnector {
  constructor(config: PropertyConfig) {
    super(config);
  }

  async checkAvailability(dateRange: DateRange): Promise<AvailabilityResult> {
    // Check availability cache in database
    const checkInStr = this.formatDate(dateRange.checkIn);
    const checkOutStr = this.formatDate(dateRange.checkOut);

    const nights = this.calculateNights(dateRange.checkIn, dateRange.checkOut);
    const dates: string[] = [];

    for (let i = 0; i < nights; i++) {
      const date = new Date(dateRange.checkIn);
      date.setDate(date.getDate() + i);
      dates.push(this.formatDate(date));
    }

    // Check if all dates are available in cache
    const cachedAvailability = await query<AvailabilityCacheRow>(
      `SELECT * FROM "AvailabilityCache" WHERE "propertyId" = $1 AND "date" = ANY($2::date[])`,
      [this.config.propertyId, dates.map(d => new Date(d))],
    );

    // If we don't have cache for all dates, assume unavailable
    if (cachedAvailability.length !== nights) {
      return {
        available: false,
        error: 'Availability not cached - please check manually',
      };
    }

    // Check if all nights are available
    const allAvailable = cachedAvailability.every(day => day.available);

    if (!allAvailable) {
      return {
        available: false,
      };
    }

    // Calculate average price
    const avgPrice = cachedAvailability.reduce((sum, day) => sum + (day.price || 0), 0) / nights;

    return {
      available: true,
      price: avgPrice,
    };
  }

  async fetchCalendar(startDate: Date, endDate: Date): Promise<Map<string, AvailabilityResult>> {
    const results = new Map<string, AvailabilityResult>();

    const cached = await query<AvailabilityCacheRow>(
      `SELECT * FROM "AvailabilityCache" WHERE "propertyId" = $1 AND "date" >= $2 AND "date" <= $3`,
      [this.config.propertyId, startDate, endDate],
    );

    for (const entry of cached) {
      const dateStr = this.formatDate(entry.date);
      results.set(dateStr, {
        available: entry.available,
        price: entry.price || undefined,
      });
    }

    return results;
  }

  async validateConfig(): Promise<boolean> {
    // Manual connector has no special config requirements
    return true;
  }

  getName(): string {
    return 'Manual';
  }
}
