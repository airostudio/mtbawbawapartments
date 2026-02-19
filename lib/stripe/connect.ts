/**
 * Stripe Connect integration for operator payouts
 */

import Stripe from 'stripe';
import { env } from '@/lib/utils/env';
import { query, queryOne, generateId } from '@/lib/db';
import type { Operator, Payout } from '@/lib/db/types';

// Lazy-initialized Stripe client
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Create a Stripe Connect account for an operator
 */
export async function createConnectedAccount(params: {
  operatorId: string;
  email: string;
  businessName?: string;
  country?: string;
}) {
  const stripe = getStripeClient();

  const account = await stripe.accounts.create({
    type: 'express', // or 'standard' for more control
    country: params.country || 'AU',
    email: params.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual', // or 'company'
    metadata: {
      operatorId: params.operatorId,
      businessName: params.businessName || '',
    },
  });

  // Update operator record
  await query(
    `UPDATE "Operator" SET
      "stripeAccountId" = $1, "stripeAccountStatus" = 'pending',
      "stripeDetailsSubmitted" = $2, "stripeChargesEnabled" = $3,
      "stripePayoutsEnabled" = $4, "updatedAt" = NOW()
     WHERE "id" = $5`,
    [account.id, account.details_submitted || false, account.charges_enabled || false, account.payouts_enabled || false, params.operatorId],
  );

  return account;
}

/**
 * Create an onboarding link for operator to complete Stripe Connect setup
 */
export async function createOnboardingLink(params: {
  accountId: string;
  returnUrl?: string;
  refreshUrl?: string;
}) {
  const stripe = getStripeClient();

  const accountLink = await stripe.accountLinks.create({
    account: params.accountId,
    refresh_url: params.refreshUrl || `${env.NEXT_PUBLIC_APP_URL}/admin/operators/onboarding/refresh`,
    return_url: params.returnUrl || `${env.NEXT_PUBLIC_APP_URL}/admin/operators/onboarding/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Retrieve account details and sync with database
 */
export async function syncConnectedAccount(accountId: string) {
  const stripe = getStripeClient();

  const account = await stripe.accounts.retrieve(accountId);

  // Find operator by Stripe account ID
  const operator = await queryOne<Operator>(
    `SELECT * FROM "Operator" WHERE "stripeAccountId" = $1`,
    [accountId],
  );

  if (!operator) {
    throw new Error('Operator not found for Stripe account');
  }

  // Update operator with latest Stripe status
  await query(
    `UPDATE "Operator" SET
      "stripeAccountStatus" = $1, "stripeDetailsSubmitted" = $2,
      "stripeChargesEnabled" = $3, "stripePayoutsEnabled" = $4,
      "stripeOnboardingComplete" = $5, "updatedAt" = NOW()
     WHERE "id" = $6`,
    [
      account.charges_enabled ? 'active' : 'pending',
      account.details_submitted || false,
      account.charges_enabled || false,
      account.payouts_enabled || false,
      (account.details_submitted && account.charges_enabled) || false,
      operator.id,
    ],
  );

  return account;
}

/**
 * Create a checkout session with destination charge to operator
 */
export async function createDestinationChargeSession(params: {
  bookingId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  operatorAmount: number; // Amount to transfer to operator
  platformFee: number; // Platform fee to keep
  guestEmail: string;
  stripeAccountId: string; // Operator's Stripe Connect account
}) {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: params.propertyName,
            description: `${params.nights} night${params.nights > 1 ? 's' : ''} · ${params.checkIn} to ${params.checkOut}`,
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
    payment_intent_data: {
      application_fee_amount: Math.round(params.platformFee * 100), // Platform fee in cents
      transfer_data: {
        destination: params.stripeAccountId,
      },
      metadata: {
        bookingId: params.bookingId,
      },
    },
    metadata: {
      bookingId: params.bookingId,
    },
  });

  return session;
}

/**
 * Create a manual transfer to operator (for manual payout mode)
 */
export async function createTransferToOperator(params: {
  amount: number;
  currency?: string;
  stripeAccountId: string;
  description: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripeClient();

  const transfer = await stripe.transfers.create({
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: params.currency || 'aud',
    destination: params.stripeAccountId,
    description: params.description,
    metadata: params.metadata,
  });

  return transfer;
}

/**
 * Get account balance for an operator
 */
export async function getAccountBalance(accountId: string) {
  const stripe = getStripeClient();

  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  });

  return balance;
}

/**
 * Create a payout for an operator (batch payout for multiple bookings)
 */
export async function createBatchPayout(params: {
  operatorId: string;
  bookingIds: string[];
  amount: number;
}) {
  const operator = await queryOne<Operator>(
    `SELECT * FROM "Operator" WHERE "id" = $1`,
    [params.operatorId],
  );

  if (!operator) {
    throw new Error('Operator not found');
  }

  if (!operator.stripeAccountId) {
    throw new Error('Operator does not have a Stripe Connect account');
  }

  // Create payout record
  const payout = await queryOne<Payout>(
    `INSERT INTO "Payout" ("id", "operatorId", "amount", "bookingIds", "periodStart", "periodEnd", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
     RETURNING *`,
    [generateId(), params.operatorId, params.amount, params.bookingIds, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  );

  if (!payout) {
    throw new Error('Failed to create payout record');
  }

  // If using auto Connect mode, create the transfer
  if (operator.payoutMode === 'auto_connect') {
    try {
      const transfer = await createTransferToOperator({
        amount: params.amount,
        stripeAccountId: operator.stripeAccountId,
        description: `Payout for bookings ${params.bookingIds.join(', ')}`,
        metadata: {
          payoutId: payout.id,
          operatorId: params.operatorId,
        },
      });

      // Update payout record with transfer details
      await query(
        `UPDATE "Payout" SET "stripeTransferId" = $1, "status" = 'processing', "updatedAt" = NOW() WHERE "id" = $2`,
        [transfer.id, payout.id],
      );

      // Update bookings
      await query(
        `UPDATE "Booking" SET "operatorPaid" = true, "operatorPaidAt" = $1, "operatorPaidAmount" = $2, "updatedAt" = NOW()
         WHERE "id" = ANY($3::text[])`,
        [new Date(), params.amount / params.bookingIds.length, params.bookingIds],
      );

      return { payout, transfer };
    } catch (error) {
      // Update payout status to failed
      await query(
        `UPDATE "Payout" SET "status" = 'failed', "failureReason" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
        [error instanceof Error ? error.message : 'Unknown error', payout.id],
      );

      throw error;
    }
  }

  // Manual mode - just create the payout record
  return { payout };
}

/**
 * Verify webhook signature for Connect events
 */
export async function verifyConnectWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
) {
  const stripe = getStripeClient();

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );

  return event;
}
