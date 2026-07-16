import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, userId: session.userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, images: true } },
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Not found', message: 'Order not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 },
      );
    }
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch order' },
      { status: 500 },
    );
  }
}
