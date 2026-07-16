import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireAuth();
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { city: 'asc' }],
    });

    return NextResponse.json({ data: addresses });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch addresses' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { name, street, city, state, zip, country, phone, isDefault } = body;

    if (!name || !street || !city || !state || !zip || !country) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        name,
        street,
        city,
        state,
        zip,
        country,
        phone: phone || '',
        isDefault: !!isDefault,
      },
    });

    return NextResponse.json({ data: address, message: 'Address created' }, { status: 201 });
  } catch (error) {
    console.error('Address create error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to create address' },
      { status: 500 },
    );
  }
}
