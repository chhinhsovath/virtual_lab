import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/callback', '/auth/register'];
  
  // Allow access to public routes and static assets
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/register') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname === '/') {
    return NextResponse.next();
  }

  // Check for session token on protected routes
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // For dashboard and protected routes, validate session and permissions
  if (pathname.startsWith('/dashboard')) {
    try {
      // Validate session by making a request to our session API
      const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
          'Cookie': `session=${sessionToken}`
        }
      });

      if (!sessionResponse.ok) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      const sessionData = await sessionResponse.json();
      
      // Add user data to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', sessionData.user.id);
      requestHeaders.set('x-user-roles', JSON.stringify(sessionData.user.roles));
      requestHeaders.set('x-user-permissions', JSON.stringify(sessionData.user.permissions));
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // If session validation fails, redirect to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // For root path, redirect to dashboard if authenticated, otherwise to login
  if (pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};