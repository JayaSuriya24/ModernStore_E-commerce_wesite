import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
          },
        },
        payment: { select: { status: true, method: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 },
      );
    }
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
