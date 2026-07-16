import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Not authenticated' },
        { status: 401 },
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Something went wrong' },
      { status: 500 },
    );
  }
}
