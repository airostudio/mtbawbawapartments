/**
 * Operators API - CRUD operations for property operators
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

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

    const operators = await prisma.operator.findMany({
      where: includeInactive ? {} : { active: true },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            slug: true,
            active: true,
          },
        },
        _count: {
          select: {
            properties: true,
            payouts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

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
    const existing = await prisma.operator.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Operator with this email already exists' },
        { status: 400 }
      );
    }

    const operator = await prisma.operator.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        bookingUrl: data.bookingUrl,
        preferredContact: data.preferredContact || 'email',
      },
    });

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
