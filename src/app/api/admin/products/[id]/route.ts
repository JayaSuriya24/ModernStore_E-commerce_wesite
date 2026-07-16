import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { slugify } from '@/utils/formatters';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    const product = await prisma.product.update({
      where: { id },
      data: { ...data, slug },
    });

    return NextResponse.json({ data: product, message: 'Product updated' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    console.error('Admin product update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    console.error('Admin product delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
