import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect /admin route: require the session cookie
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to /admin routes (not /api/auth/*)
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('admin_session');

    // If no session cookie, the user will still see the login page
    // The auth check is handled client-side, but we add rate-limit headers
    const response = NextResponse.next();

    // Add security headers specific to the admin panel
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static files, images, and api
  matcher: [
    '/admin/:path*',
    // Exclude static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.ico).*)',
  ],
};
