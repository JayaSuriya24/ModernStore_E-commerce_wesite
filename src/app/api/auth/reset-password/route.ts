import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { token, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token', message: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
