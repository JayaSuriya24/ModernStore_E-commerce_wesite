import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { couponSchema } from '@/lib/validators';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const result = couponSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const data = result.data;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        discount: data.discount,
        type: data.type,
        minOrder: data.minOrder,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ data: coupon, message: 'Coupon updated' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: 'Coupon deleted' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
