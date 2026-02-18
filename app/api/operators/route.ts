/**
 * Operators API - CRUD operations for property operators
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query, queryOne, generateId } from '@/lib/db';
import type { Operator } from '@/lib/db/types';

const createOperatorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  bookingUrl: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'portal']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const operators = await query<Operator & { properties: any[]; _count: { properties: number; payouts: number } }>(
      `SELECT o.*,
         COALESCE((
           SELECT json_agg(json_build_object('id', p."id", 'name', p."name", 'slug', p."slug", 'active', p."active"))
           FROM "Property" p WHERE p."operatorId" = o."id"
         ), '[]'::json) AS properties,
         json_build_object(
           'properties', (SELECT COUNT(*)::int FROM "Property" WHERE "operatorId" = o."id"),
           'payouts', (SELECT COUNT(*)::int FROM "Payout" WHERE "operatorId" = o."id")
         ) AS "_count"
       FROM "Operator" o
       ${includeInactive ? '' : 'WHERE o."active" = true'}
       ORDER BY o."name" ASC`,
    );

    return NextResponse.json({ operators });
  } catch (error) {
    console.error('Error fetching operators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch operators' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOperatorSchema.parse(body);

    // Check if operator with email already exists
    const existing = await queryOne<Operator>(
      `SELECT "id" FROM "Operator" WHERE "email" = $1`,
      [data.email],
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Operator with this email already exists' },
        { status: 400 }
      );
    }

    const operator = await queryOne<Operator>(
      `INSERT INTO "Operator" ("id", "name", "email", "phone", "businessName", "bookingUrl", "preferredContact", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [generateId(), data.name, data.email, data.phone || null, data.businessName || null, data.bookingUrl || null, data.preferredContact || 'email'],
    );

    return NextResponse.json({ operator }, { status: 201 });
  } catch (error) {
    console.error('Error creating operator:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create operator' },
      { status: 500 }
    );
  }
}
