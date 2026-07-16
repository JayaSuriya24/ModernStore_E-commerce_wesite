import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { slugify } from '@/utils/formatters';

export async function GET() {
  try {
    await requireAdmin();
    const products = await prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: products });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    console.error('Admin products error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const data = result.data;
    const slug = slugify(data.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Duplicate', message: 'A product with this name already exists' },
        { status: 409 },
      );
    }

    const product = await prisma.product.create({
      data: { ...data, slug },
    });

    return NextResponse.json({ data: product, message: 'Product created' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    console.error('Admin product create error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
