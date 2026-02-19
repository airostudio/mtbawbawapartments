/**
 * Individual Operator API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query, queryOne } from '@/lib/db';
import type { Operator, Payout } from '@/lib/db/types';

const updateOperatorSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  bookingUrl: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'portal']).optional(),
  payoutMode: z.enum(['manual', 'auto_connect']).optional(),
  payoutSchedule: z.enum(['daily', 'weekly', 'monthly']).optional(),
  minimumPayout: z.number().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const operator = await queryOne<Operator & { properties: any[]; payouts: Payout[]; _count: { properties: number; payouts: number } }>(
      `SELECT o.*,
         COALESCE((SELECT json_agg(p) FROM "Property" p WHERE p."operatorId" = o."id"), '[]'::json) AS properties,
         COALESCE((SELECT json_agg(sub) FROM (SELECT * FROM "Payout" WHERE "operatorId" = o."id" ORDER BY "createdAt" DESC LIMIT 10) sub), '[]'::json) AS payouts,
         json_build_object(
           'properties', (SELECT COUNT(*)::int FROM "Property" WHERE "operatorId" = o."id"),
           'payouts', (SELECT COUNT(*)::int FROM "Payout" WHERE "operatorId" = o."id")
         ) AS "_count"
       FROM "Operator" o
       WHERE o."id" = $1`,
      [id],
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ operator });
  } catch (error) {
    console.error('Error fetching operator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operator' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateOperatorSchema.parse(body);

    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`"${key}" = $${paramIdx}`);
      values.push(value);
      paramIdx++;
    }
    setClauses.push(`"updatedAt" = NOW()`);
    values.push(id);

    const operator = await queryOne<Operator>(
      `UPDATE "Operator" SET ${setClauses.join(', ')} WHERE "id" = $${paramIdx} RETURNING *`,
      values,
    );

    if (!operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ operator });
  } catch (error) {
    console.error('Error updating operator:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update operator' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - just mark as inactive
    await query(
      `UPDATE "Operator" SET "active" = false, "updatedAt" = NOW() WHERE "id" = $1`,
      [id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting operator:', error);
    return NextResponse.json(
      { error: 'Failed to delete operator' },
      { status: 500 }
    );
  }
}
