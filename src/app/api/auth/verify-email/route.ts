import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token', message: 'Verification token is required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token', message: 'Invalid or expired verification token' },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
