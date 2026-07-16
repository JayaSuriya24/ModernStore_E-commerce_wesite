import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Missing code', message: 'Coupon code is required' },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon', message: 'Coupon code not found' },
        { status: 404 },
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Inactive coupon', message: 'This coupon is no longer active' },
        { status: 400 },
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Expired coupon', message: 'This coupon has expired' },
        { status: 400 },
      );
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Limit reached', message: 'This coupon has reached its usage limit' },
        { status: 400 },
      );
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json(
        {
          error: 'Minimum not met',
          message: `Minimum order of $${(coupon.minOrder / 100).toFixed(2)} required`,
        },
        { status: 400 },
      );
    }

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = Math.round((subtotal * coupon.discount) / 100);
    } else {
      discount = Math.min(coupon.discount, subtotal);
    }

    return NextResponse.json({
      data: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        discountAmount: discount,
      },
      message: 'Coupon applied successfully',
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to validate coupon' },
      { status: 500 },
    );
  }
}
