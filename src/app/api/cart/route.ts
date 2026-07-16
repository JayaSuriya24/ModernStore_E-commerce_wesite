import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();

    const items = await prisma.cart.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const validItems = items.filter((item) => item.product?.isActive);

    return NextResponse.json({ data: validItems });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your cart' },
        { status: 401 },
      );
    }
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch cart' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing field', message: 'Product ID is required' },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Not found', message: 'Product not found' },
        { status: 404 },
      );
    }

    const existingItem = await prisma.cart.findUnique({
      where: { userId_productId: { userId: session.userId, productId } },
    });

    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
      const updated = await prisma.cart.update({
        where: { id: existingItem.id },
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
    }

    const quantityToAdd = Math.min(quantity, product.stock);
    const item = await prisma.cart.create({
      data: {
        userId: session.userId,
        productId,
        quantity: quantityToAdd,
      },
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

    return NextResponse.json({ data: item, message: 'Added to cart' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in' },
        { status: 401 },
      );
    }
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to add to cart' },
      { status: 500 },
    );
  }
}
