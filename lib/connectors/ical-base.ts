/**
 * Base class for all iCal-based availability connectors.
 * Handles fetching and parsing iCal feeds from any OTA or booking platform.
 * Booking.com, Airbnb, Sirvoy, VRBO, and others all export standard iCal feeds.
 */

import { BaseConnector, DateRange, AvailabilityResult, PropertyConfig } from './base';
import ICAL from 'ical.js';

export interface ICalConfig {
  icalUrl: string; // iCal feed URL from the OTA/platform
}

export interface ICalBooking {
  start: Date;
  end: Date;
  summary: string;
  uid: string;
}

export abstract class ICalBaseConnector extends BaseConnector {
  protected icalConfig: ICalConfig;

  constructor(config: PropertyConfig) {
    super(config);
    this.icalConfig = config.connectorConfig as ICalConfig;
  }

  async checkAvailability(dateRange: DateRange): Promise<AvailabilityResult> {
    try {
      const icalData = await this.fetchICalFeed();
      const bookings = this.parseICalBookings(icalData);

      const hasConflict = bookings.some(booking =>
        this.datesOverlap(dateRange.checkIn, dateRange.checkOut, booking.start, booking.end)
      );

      return { available: !hasConflict };
    } catch (error) {
      console.error(`[${this.getName()}] checkAvailability error:`, error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async fetchCalendar(startDate: Date, endDate: Date): Promise<Map<string, AvailabilityResult>> {
    const results = new Map<string, AvailabilityResult>();

    try {
      const icalData = await this.fetchICalFeed();
      const bookings = this.parseICalBookings(icalData);

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = this.formatDate(currentDate);

        const isBlocked = bookings.some(
          booking => currentDate >= booking.start && currentDate < booking.end
        );

        results.set(dateStr, { available: !isBlocked });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error(`[${this.getName()}] fetchCalendar error:`, error);
    }

    return results;
  }

  async validateConfig(): Promise<boolean> {
    if (!this.icalConfig?.icalUrl) {
      throw new Error(`iCal URL is required for ${this.getName()} connector`);
    }
    try {
      await this.fetchICalFeed();
      return true;
    } catch (error) {
      console.error(`[${this.getName()}] config validation failed:`, error);
      return false;
    }
  }

  /**
   * Fetch raw iCal data from the configured URL
   */
  protected async fetchICalFeed(): Promise<string> {
    const response = await fetch(this.icalConfig.icalUrl, {
      headers: {
        'User-Agent': 'Mt-Baw-Baw-Apartments/1.0 (Booking System)',
        'Accept': 'text/calendar, text/plain, */*',
      },
      // 10 second timeout — OTA feeds can be slow
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch iCal feed from ${this.getName()}: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  }

  /**
   * Parse iCal data into booking objects
   */
  protected parseICalBookings(icalData: string): ICalBooking[] {
    const bookings: ICalBooking[] = [];

    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      for (const vevent of vevents) {
        const event = new ICAL.Event(vevent);

        // Skip cancelled events
        const status = vevent.getFirstPropertyValue('status');
        if (status === 'CANCELLED') continue;

        bookings.push({
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary || 'Blocked',
          uid: event.uid || '',
        });
      }
    } catch (error) {
      console.error(`[${this.getName()}] iCal parse error:`, error);
      throw new Error('Invalid iCal format received');
    }

    return bookings;
  }

  /**
   * Check if two date ranges overlap.
   * Uses half-open interval [start, end) which is standard for nightly stays.
   */
  protected datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }
}
