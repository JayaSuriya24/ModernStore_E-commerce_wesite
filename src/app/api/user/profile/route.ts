import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, wishlist: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Not found', message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, avatar } = body;

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: updated, message: 'Profile updated' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
