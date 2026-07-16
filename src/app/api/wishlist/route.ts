import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireAuth();
    const items = await prisma.wishlist.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const itemsWithRating = items.map((item) => {
      const reviews = item.product.reviews;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
      return {
        ...item,
        product: { ...item.product, averageRating, _count: { reviews: reviews.length } },
      };
    });

    return NextResponse.json({ data: itemsWithRating });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch wishlist' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.userId, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ data: null, message: 'Removed from wishlist' });
    }

    const item = await prisma.wishlist.create({
      data: { userId: session.userId, productId },
    });

    return NextResponse.json({ data: item, message: 'Added to wishlist' }, { status: 201 });
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to update wishlist' },
      { status: 500 },
    );
  }
}
