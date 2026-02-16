/**
 * Sirvoy connector - integrates with Sirvoy booking engine via iCal
 * https://www.sirvoy.com/
 */

import { BaseConnector, DateRange, AvailabilityResult, PropertyConfig } from './base';
import ICAL from 'ical.js';

interface SirvoyConfig {
  icalUrl: string; // iCal feed URL from Sirvoy
  roomId?: string; // Optional room/unit ID
}

export class SirvoyConnector extends BaseConnector {
  private sirvoyConfig: SirvoyConfig;

  constructor(config: PropertyConfig) {
    super(config);
    this.sirvoyConfig = config.connectorConfig as SirvoyConfig;
  }

  async checkAvailability(dateRange: DateRange): Promise<AvailabilityResult> {
    try {
      // Fetch iCal feed
      const icalData = await this.fetchICalFeed();

      // Parse bookings
      const bookings = this.parseICalBookings(icalData);

      // Check if any booking overlaps with requested dates
      const hasConflict = bookings.some(booking => {
        return this.datesOverlap(
          dateRange.checkIn,
          dateRange.checkOut,
          booking.start,
          booking.end
        );
      });

      return {
        available: !hasConflict,
      };
    } catch (error) {
      console.error('Sirvoy connector error:', error);
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

      // Generate all dates in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = this.formatDate(currentDate);

        // Check if this date is blocked by any booking
        const isBlocked = bookings.some(booking => {
          return currentDate >= booking.start && currentDate < booking.end;
        });

        results.set(dateStr, {
          available: !isBlocked,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } catch (error) {
      console.error('Sirvoy calendar fetch error:', error);
    }

    return results;
  }

  async validateConfig(): Promise<boolean> {
    if (!this.sirvoyConfig.icalUrl) {
      throw new Error('iCal URL is required for Sirvoy connector');
    }

    try {
      // Try fetching the iCal feed to validate
      await this.fetchICalFeed();
      return true;
    } catch (error) {
      console.error('Sirvoy config validation failed:', error);
      return false;
    }
  }

  getName(): string {
    return 'Sirvoy';
  }

  /**
   * Fetch iCal feed from Sirvoy
   */
  private async fetchICalFeed(): Promise<string> {
    const response = await fetch(this.sirvoyConfig.icalUrl, {
      headers: {
        'User-Agent': 'Mt-Baw-Baw-Apartments/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed: ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Parse iCal data and extract bookings
   */
  private parseICalBookings(icalData: string): Array<{ start: Date; end: Date; summary: string }> {
    const bookings: Array<{ start: Date; end: Date; summary: string }> = [];

    try {
      const jcalData = ICAL.parse(icalData);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      for (const vevent of vevents) {
        const event = new ICAL.Event(vevent);

        bookings.push({
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary || 'Booking',
        });
      }
    } catch (error) {
      console.error('Error parsing iCal data:', error);
      throw new Error('Invalid iCal format');
    }

    return bookings;
  }

  /**
   * Check if two date ranges overlap
   */
  private datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }
}
