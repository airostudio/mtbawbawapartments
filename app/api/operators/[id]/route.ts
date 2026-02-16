/**
 * Individual Operator API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

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

    const operator = await prisma.operator.findUnique({
      where: { id },
      include: {
        properties: true,
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            properties: true,
            payouts: true,
          },
        },
      },
    });

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

    const operator = await prisma.operator.update({
      where: { id },
      data,
    });

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
    await prisma.operator.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting operator:', error);
    return NextResponse.json(
      { error: 'Failed to delete operator' },
      { status: 500 }
    );
  }
}
