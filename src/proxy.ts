import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();

    // Security headers for admin panel
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    // Optionally validate token here for early redirect (non-blocking — auth is enforced at API level)
    const tokenCookie = request.cookies.get(SESSION_COOKIE);
    if (tokenCookie?.value) {
      const session = await verifySessionToken(tokenCookie.value);
      if (!session) {
        // Token present but invalid/expired → clear stale cookie
        response.cookies.delete(SESSION_COOKIE);
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.ico).*)',
  ],
};
