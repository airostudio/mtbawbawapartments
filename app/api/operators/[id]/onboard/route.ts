/**
 * Stripe Connect Onboarding API
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import type { Operator } from '@/lib/db/types';
import {
  createConnectedAccount,
  createOnboardingLink,
  syncConnectedAccount,
} from '@/lib/stripe/connect';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const operator = await queryOne<Operator>(
      `SELECT * FROM "Operator" WHERE "id" = $1`,
      [id],
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    let accountId = operator.stripeAccountId;

    // Create Stripe Connect account if it doesn't exist
    if (!accountId) {
      const account = await createConnectedAccount({
        operatorId: operator.id,
        email: operator.email,
        businessName: operator.businessName || operator.name,
        country: 'AU',
      });

      accountId = account.id;
    } else {
      // Sync existing account
      await syncConnectedAccount(accountId);
    }

    // Generate onboarding link
    const onboardingUrl = await createOnboardingLink({
      accountId,
    });

    return NextResponse.json({
      onboardingUrl,
      accountId,
    });
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const operator = await queryOne<Operator>(
      `SELECT * FROM "Operator" WHERE "id" = $1`,
      [id],
    );

    if (!operator || !operator.stripeAccountId) {
      return NextResponse.json(
        { error: 'Operator or Stripe account not found' },
        { status: 404 }
      );
    }

    // Sync account status
    const account = await syncConnectedAccount(operator.stripeAccountId);

    // Get updated operator
    const updatedOperator = await queryOne<Operator>(
      `SELECT * FROM "Operator" WHERE "id" = $1`,
      [id],
    );

    return NextResponse.json({
      operator: updatedOperator,
      stripeAccount: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
