import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json({ products: [], categories: [], popular: [] });
    }

    const [products, categories, popular] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, name: true, slug: true, price: true, images: true, category: { select: { name: true, slug: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
        take: 3,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, price: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ products, categories, popular });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch suggestions' },
      { status: 500 },
    );
  }
}
