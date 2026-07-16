import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

const protectedRoutes = ['/checkout', '/orders', '/admin'];
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('modernstore-token')?.value;

  let session = null;
  if (token) {
    session = await verifyToken(token);
  }

  if (authRoutes.some((route) => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && session) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
