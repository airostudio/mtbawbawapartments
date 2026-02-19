/**
 * iCal export endpoint
 *
 * Generates a standard iCal (.ics) feed of all confirmed bookings for a property.
 * Import this URL into Airbnb and Booking.com to keep their calendars in sync
 * and prevent double-bookings.
 *
 * Usage:
 *   GET /api/ical/mountain-view-chalet
 *   GET /api/ical/mountain-view-chalet?token=<ICAL_SECRET>  (if auth is enabled)
 *
 * How to import in each platform:
 *   Airbnb:       Listing → Availability → Sync calendars → Import calendar
 *   Booking.com:  Extranet → Calendar → Sync calendars → Add calendar → paste URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Property, Booking } from '@/lib/db/types';

/**
 * Format a Date as YYYYMMDD for all-day iCal events (no time zone ambiguity)
 */
function toICalDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Format a Date as YYYYMMDDTHHMMSSZ (UTC timestamp) for DTSTAMP
 */
function toICalTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace('.000', '');
}

/**
 * Escape iCal text values per RFC 5545
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertySlug: string }> }
) {
  const { propertySlug } = await params;

  // Optional token-based auth to prevent competitors scraping your calendar.
  // Set ICAL_SECRET in your env to enable. Leave unset to keep public (simpler).
  const icalSecret = process.env.ICAL_SECRET;
  if (icalSecret) {
    const token = request.nextUrl.searchParams.get('token');
    if (token !== icalSecret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Fetch property
  const property = await queryOne<Property>(
    `SELECT * FROM "Property" WHERE "slug" = $1`,
    [propertySlug],
  );

  if (!property || !property.active) {
    return new NextResponse('Property not found', { status: 404 });
  }

  // Fetch all confirmed or paid bookings (exclude cancelled/pending-unpaid)
  const bookings = await query<Booking>(
    `SELECT * FROM "Booking"
     WHERE "propertyId" = $1
       AND ("status" = 'confirmed' OR ("status" = 'pending' AND "paymentStatus" = 'succeeded'))
     ORDER BY "checkIn" ASC`,
    [property.id],
  );

  const now = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mtbawbawapartments.com.au';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Mt Baw Baw Apartments';

  // Build iCal lines — using folding (max 75 chars per line per RFC 5545)
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeICalText(siteName)}//Booking System//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(property.name)} - Bookings`,
    `X-WR-CALDESC:Confirmed bookings for ${escapeICalText(property.name)}`,
    'X-WR-TIMEZONE:UTC',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    `SOURCE;VALUE=URI:${appUrl}/api/ical/${propertySlug}`,
  ];

  for (const booking of bookings) {
    lines.push('BEGIN:VEVENT');
    // Use the booking ID as the UID so re-imports are idempotent
    lines.push(`UID:booking-${booking.id}@${new URL(appUrl).hostname}`);
    lines.push(`DTSTAMP:${toICalTimestamp(now)}`);
    // All-day dates — no time component avoids timezone conversion issues on import
    lines.push(`DTSTART;VALUE=DATE:${toICalDate(booking.checkIn)}`);
    lines.push(`DTEND;VALUE=DATE:${toICalDate(booking.checkOut)}`);
    lines.push(`SUMMARY:${escapeICalText(`${siteName} - Reserved`)}`);
    lines.push(`DESCRIPTION:${escapeICalText(`Booking ref: ${booking.id}`)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push(`LAST-MODIFIED:${toICalTimestamp(booking.updatedAt)}`);
    lines.push(`CREATED:${toICalTimestamp(booking.createdAt)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  const icalContent = lines.join('\r\n') + '\r\n';

  return new NextResponse(icalContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${propertySlug}.ics"`,
      // Allow Airbnb/Booking.com crawlers to fetch this feed
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
