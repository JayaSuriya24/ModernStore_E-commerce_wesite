import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseInt(minPrice, 10);
      if (maxPrice) (where.price as Record<string, number>).lte = parseInt(maxPrice, 10);
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'relevance':
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithRating = products.map((product) => {
      const reviews = product.reviews;
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
      return { ...product, averageRating, _count: { reviews: reviews.length } };
    });

    let filteredProducts = productsWithRating;
    if (rating) {
      const minRating = parseInt(rating, 10);
      filteredProducts = productsWithRating.filter((p) => p.averageRating >= minRating);
    }

    const paginatedProducts = filteredProducts.slice(0, limit);
    const totalFiltered = filteredProducts.length;

    return NextResponse.json({
      data: rating ? paginatedProducts : productsWithRating,
      pagination: {
        page,
        limit,
        total: rating ? totalFiltered : total,
        totalPages: Math.ceil((rating ? totalFiltered : total) / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}
