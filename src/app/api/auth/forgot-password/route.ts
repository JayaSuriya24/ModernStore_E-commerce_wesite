import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validators';
import { sendEmail, generateResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a reset link.',
      });
    }

    const resetToken = nanoid();
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetExpiry },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      const emailContent = generateResetEmail(resetUrl);
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch {
      console.log('Email sending failed');
    }

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
