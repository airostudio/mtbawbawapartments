/**
 * Booking.com iCal connector
 *
 * Imports blocked dates from a Booking.com property's iCal export feed.
 * This is a read-only / one-way sync: Booking.com bookings block dates in our system.
 *
 * To get the iCal URL from Booking.com:
 *   Extranet → Calendar → Export calendar → Copy the iCal URL
 *
 * Full two-way sync (push our rates/availability to Booking.com) requires
 * Booking.com Connectivity Partner status via connect.booking.com
 *
 * connectorConfig shape:
 * {
 *   "icalUrl": "https://ical.booking.com/v1/export?t=<token>"
 * }
 */

import { PropertyConfig } from './base';
import { ICalBaseConnector } from './ical-base';

export class BookingComConnector extends ICalBaseConnector {
  constructor(config: PropertyConfig) {
    super(config);
  }

  getName(): string {
    return 'Booking.com';
  }
}
