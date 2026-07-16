import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { sendEmail, generateVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', message: result.error.errors[0].message },
        { status: 400 },
      );
    }

    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User exists', message: 'An account with this email already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = nanoid();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        resetToken: verificationToken,
        resetExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    await setAuthCookie(token);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      const emailContent = generateVerificationEmail(verificationUrl);
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch {
      console.log('Email sending failed, but user was created');
    }

    return NextResponse.json(
      { data: user, message: 'Account created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
