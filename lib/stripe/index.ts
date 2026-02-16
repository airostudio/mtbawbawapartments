/**
 * Stripe client and utilities
 */

import Stripe from 'stripe';
import { env } from '@/lib/utils/env';

// Initialize Stripe client
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

/**
 * Create a checkout session for a booking
 */
export async function createCheckoutSession(params: {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  guestEmail: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${params.propertyName}`,
            description: `${params.nights} night${params.nights > 1 ? 's' : ''} · ${params.checkIn} to ${params.checkOut}`,
            images: [], // Add property images if available
          },
          unit_amount: Math.round(params.totalPrice * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/booking/cancelled`,
    customer_email: params.guestEmail,
    metadata: {
      bookingId: params.bookingId,
    },
    payment_intent_data: {
      metadata: {
        bookingId: params.bookingId,
      },
    },
  });

  return session;
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Calculate Stripe fee (2.9% + 30¢ for card payments in Australia)
 */
export function calculateStripeFee(amount: number): number {
  return amount * 0.029 + 0.30;
}
