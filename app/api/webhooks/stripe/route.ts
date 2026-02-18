/**
 * Stripe Webhook Handler
 * Handles payment confirmation and other Stripe events
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { query, queryOne } from '@/lib/db';
import type { Booking, Property } from '@/lib/db/types';
import { sendBookingAlert } from '@/lib/services/alerts';
import { env } from '@/lib/utils/env';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    console.error('No booking ID in session metadata');
    return;
  }

  await query(
    `UPDATE "Booking" SET "paymentStatus" = 'succeeded', "stripePaymentIntent" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
    [session.payment_intent as string, bookingId],
  );

  const booking = await queryOne<Booking & { property: Property }>(
    `SELECT b.*, row_to_json(p) AS property
     FROM "Booking" b JOIN "Property" p ON b."propertyId" = p."id"
     WHERE b."id" = $1`,
    [bookingId],
  );

  if (!booking) return;

  console.log(`Payment succeeded for booking ${bookingId}`);

  // Send booking alert
  if (!booking.alertsSent) {
    await sendBookingAlert(booking);
    await query(
      `UPDATE "Booking" SET "alertsSent" = true, "updatedAt" = NOW() WHERE "id" = $1`,
      [bookingId],
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    return;
  }

  await query(
    `UPDATE "Booking" SET "paymentStatus" = 'succeeded', "stripePaymentIntent" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
    [paymentIntent.id, bookingId],
  );

  console.log(`Payment intent succeeded for booking ${bookingId}`);
}

async function handlePaymentFailed(paymentIntent: any) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (!bookingId) {
    return;
  }

  await query(
    `UPDATE "Booking" SET "paymentStatus" = 'failed', "updatedAt" = NOW() WHERE "id" = $1`,
    [bookingId],
  );

  console.log(`Payment failed for booking ${bookingId}`);
}
