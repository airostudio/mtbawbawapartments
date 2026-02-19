/**
 * Stripe client and utilities
 *
 * Uses lazy initialisation so the module can be imported at build time
 * without a valid STRIPE_SECRET_KEY.  The client is created on first use.
 */

import Stripe from 'stripe';
import { env } from '@/lib/utils/env';

let _client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_client) {
    const key = env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. ' +
        'Add it to .env.local for local dev or in your Vercel project settings.',
      );
    }
    _client = new Stripe(key, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });
  }
  return _client;
}

// Named export kept for convenience in routes that call stripe.* directly
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop: string | symbol) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// ── Checkout session ──────────────────────────────────────────────────────────

export async function createCheckoutSession(params: {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  guestEmail: string;
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: params.propertyName,
            description: `${params.nights} night${params.nights > 1 ? 's' : ''} · ${params.checkIn} to ${params.checkOut}`,
          },
          unit_amount: Math.round(params.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${env.NEXT_PUBLIC_APP_URL}/booking/cancelled`,
    customer_email: params.guestEmail,
    metadata: { bookingId: params.bookingId },
    payment_intent_data: { metadata: { bookingId: params.bookingId } },
  });
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId);
}

/** Australian card processing fee: 1.75% + 30¢ for domestic; 2.9% + 30¢ for international.
 *  We use the higher international rate to be safe. */
export function calculateStripeFee(amount: number): number {
  return amount * 0.029 + 0.30;
}
