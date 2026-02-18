/**
 * Checkout API - Create a Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query, queryOne, generateId } from '@/lib/db';
import type { Property, Booking } from '@/lib/db/types';
import { createCheckoutSession, calculateStripeFee } from '@/lib/stripe';
import { AvailabilityService } from '@/lib/services/availability';

const checkoutSchema = z.object({
  propertyId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1),
  numberOfGuests: z.number().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Fetch property
    const property = await queryOne<Property>(
      `SELECT * FROM "Property" WHERE "id" = $1`,
      [data.propertyId],
    );

    if (!property || !property.active) {
      return NextResponse.json(
        { error: 'Property not found or inactive' },
        { status: 404 }
      );
    }

    // Check guest capacity
    if (data.numberOfGuests > property.sleeps) {
      return NextResponse.json(
        { error: `This property sleeps up to ${property.sleeps} guests` },
        { status: 400 }
      );
    }

    // Parse dates
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return NextResponse.json(
        { error: 'Minimum stay is 1 night' },
        { status: 400 }
      );
    }

    // Check availability
    const availability = await AvailabilityService.checkAvailability(data.propertyId, {
      checkIn,
      checkOut,
    });

    if (!availability.available) {
      return NextResponse.json(
        { error: availability.error || 'Property not available for selected dates' },
        { status: 400 }
      );
    }

    // Calculate pricing — markupPercent already has seasonal adjustment applied
    const basePricePerNight = availability.price || property.basePrice;
    const totalBasePrice = basePricePerNight * nights;
    const pricePerNightWithMarkup = availability.priceWithMarkup || basePricePerNight;
    const totalPrice = pricePerNightWithMarkup * nights;
    const totalMarkup = totalPrice - totalBasePrice;
    const markupPercent = totalBasePrice > 0 ? (totalMarkup / totalBasePrice) * 100 : property.markupPercent;
    const stripeFee = calculateStripeFee(totalPrice);
    const netProfit = totalMarkup - stripeFee;

    // Create booking record
    const bookingId = generateId();
    const booking = await queryOne<Booking>(
      `INSERT INTO "Booking" (
        "id", "propertyId", "checkIn", "checkOut", "nights",
        "guestName", "guestEmail", "guestPhone", "numberOfGuests",
        "basePricePerNight", "markupPercent", "totalBasePrice", "totalMarkup",
        "totalPrice", "stripeFee", "netProfit", "status", "paymentStatus",
        "createdAt", "updatedAt"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())
      RETURNING *`,
      [
        bookingId, property.id, checkIn, checkOut, nights,
        data.guestName, data.guestEmail, data.guestPhone, data.numberOfGuests,
        basePricePerNight, markupPercent, totalBasePrice, totalMarkup,
        totalPrice, stripeFee, netProfit, 'pending', 'pending',
      ],
    );

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      bookingId: booking.id,
      propertyName: property.name,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights,
      totalPrice,
      guestEmail: data.guestEmail,
    });

    // Update booking with Stripe session ID
    await query(
      `UPDATE "Booking" SET "stripeSessionId" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      [session.id, booking!.id],
    );

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
      bookingId: booking.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
