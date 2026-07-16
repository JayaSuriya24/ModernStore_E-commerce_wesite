import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
        payment: { select: { status: true, method: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: orders });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Forbidden' ? 403 : 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
