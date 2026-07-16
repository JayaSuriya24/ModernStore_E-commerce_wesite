import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { reviewSchema } from '@/lib/validators';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing parameter', message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch reviews' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { rating, comment, productId } = result.data;

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.userId, productId } },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Duplicate', message: 'You have already reviewed this product' },
        { status: 409 },
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ data: review, message: 'Review submitted' }, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to create review' },
      { status: 500 },
    );
  }
}
