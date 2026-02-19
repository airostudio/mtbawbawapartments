/**
 * Airbnb iCal connector
 *
 * Imports blocked dates from an Airbnb listing's iCal export feed.
 * This is a read-only / one-way sync: Airbnb bookings block dates in our system.
 *
 * To get the iCal URL from Airbnb:
 *   Listing → Availability → Sync calendars → Export calendar → Copy link
 *
 * Full two-way sync (push our availability to Airbnb) requires
 * being an approved Airbnb API partner. Applications are currently paused;
 * use a channel manager (Beds24, Smoobu, Hostaway) as an intermediary
 * to achieve real-time two-way sync.
 *
 * connectorConfig shape:
 * {
 *   "icalUrl": "https://www.airbnb.com.au/calendar/ical/<listing_id>.ics?s=<token>"
 * }
 */

import { PropertyConfig } from './base';
import { ICalBaseConnector } from './ical-base';

export class AirbnbConnector extends ICalBaseConnector {
  constructor(config: PropertyConfig) {
    super(config);
  }

  getName(): string {
    return 'Airbnb';
  }
}
