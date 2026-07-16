import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, street, city, state, zip, country, phone, isDefault } = body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Not found', message: 'Address not found' },
        { status: 404 },
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(street !== undefined && { street }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zip !== undefined && { zip }),
        ...(country !== undefined && { country }),
        ...(phone !== undefined && { phone }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({ data: address, message: 'Address updated' });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to update address' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Not found', message: 'Address not found' },
        { status: 404 },
      );
    }

    await prisma.address.delete({ where: { id } });
    return NextResponse.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Address delete error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to delete address' },
      { status: 500 },
    );
  }
}
