import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await requireAuth();
    const { itemId } = await params;
    const { quantity } = await request.json();

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity', message: 'Quantity must be a positive number' },
        { status: 400 },
      );
    }

    const cartItem = await prisma.cart.findFirst({
      where: { id: itemId, userId: session.userId },
      include: { product: { select: { stock: true } } },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Not found', message: 'Cart item not found' },
        { status: 404 },
      );
    }

    if (quantity === 0) {
      await prisma.cart.delete({ where: { id: itemId } });
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    const newQuantity = Math.min(quantity, cartItem.product.stock);

    const updated = await prisma.cart.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updated, message: 'Cart updated' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 },
      );
    }
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to update cart' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  try {
    const session = await requireAuth();
    const { itemId } = await params;

    const cartItem = await prisma.cart.findFirst({
      where: { id: itemId, userId: session.userId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Not found', message: 'Cart item not found' },
        { status: 404 },
      );
    }

    await prisma.cart.delete({ where: { id: itemId } });

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 },
      );
    }
    console.error('Cart delete error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to remove item' },
      { status: 500 },
    );
  }
}
