import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/validators';
import { slugify } from '@/utils/formatters';

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const data = result.data;
    const slug = slugify(data.name);

    const category = await prisma.category.create({
      data: { ...data, slug },
    });

    return NextResponse.json({ data: category, message: 'Category created' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
