/**
 * Checkout API - Create a Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
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
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

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

    // Calculate pricing
    const basePricePerNight = availability.price || property.basePrice;
    const totalBasePrice = basePricePerNight * nights;
    const markupPercent = property.markupPercent;
    const totalMarkup = totalBasePrice * (markupPercent / 100);
    const totalPrice = totalBasePrice + totalMarkup;
    const stripeFee = calculateStripeFee(totalPrice);
    const netProfit = totalMarkup - stripeFee;

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        checkIn,
        checkOut,
        nights,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        numberOfGuests: data.numberOfGuests,
        basePricePerNight,
        markupPercent,
        totalBasePrice,
        totalMarkup,
        totalPrice,
        stripeFee,
        netProfit,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

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
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

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
