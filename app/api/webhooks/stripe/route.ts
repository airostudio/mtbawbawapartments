/**
 * POST /api/webhooks/stripe
 * Verifies the Stripe signature then handles payment lifecycle events.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { query, queryOne } from '@/lib/db';
import type { Booking, Property } from '@/lib/db/types';
import { sendBookingAlert } from '@/lib/services/alerts';
import { env } from '@/lib/utils/env';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // ── Guard: webhook secret must be configured ──────────────────────────────
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 },
    );
  }

  const body      = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // ── Verify signature ──────────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Handle events ─────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook] handler error:', error);
    // Return 200 so Stripe doesn't retry — we logged the failure
    return NextResponse.json({ error: 'Handler failed — check server logs' }, { status: 500 });
  }
}

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error('[webhook] checkout.session.completed missing bookingId in metadata');
    return;
  }

  await query(
    `UPDATE "Booking"
     SET "paymentStatus" = 'succeeded',
         "stripePaymentIntent" = $1,
         "updatedAt" = NOW()
     WHERE "id" = $2`,
    [session.payment_intent as string, bookingId],
  );

  const booking = await queryOne<Booking & { property: Property }>(
    `SELECT b.*, row_to_json(p) AS property
     FROM "Booking" b
     JOIN "Property" p ON b."propertyId" = p."id"
     WHERE b."id" = $1`,
    [bookingId],
  );

  if (!booking) return;

  if (!booking.alertsSent) {
    await sendBookingAlert(booking);
    await query(
      `UPDATE "Booking" SET "alertsSent" = true, "updatedAt" = NOW() WHERE "id" = $1`,
      [bookingId],
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) return;

  await query(
    `UPDATE "Booking"
     SET "paymentStatus" = 'succeeded',
         "stripePaymentIntent" = $1,
         "updatedAt" = NOW()
     WHERE "id" = $2`,
    [paymentIntent.id, bookingId],
  );
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) return;

  await query(
    `UPDATE "Booking"
     SET "paymentStatus" = 'failed',
         "updatedAt" = NOW()
     WHERE "id" = $1`,
    [bookingId],
  );
}
