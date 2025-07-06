import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signin', '/auth/callback', '/auth/register'];
  
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

  // For dashboard, parent, student and protected routes, validate session and permissions
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/parent') || pathname.startsWith('/student')) {
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
      
      // Check if student is trying to access main dashboard and redirect to student portal
      if (pathname === '/dashboard' && 
          (sessionData.user.roles?.includes('student') || sessionData.user.role === 'student')) {
        return NextResponse.redirect(new URL('/student', request.url));
      }
      
      // Check if parent is trying to access main dashboard and redirect to parent portal
      if (pathname === '/dashboard' && 
          (sessionData.user.roles?.includes('parent') || sessionData.user.roles?.includes('guardian') || sessionData.user.role === 'parent')) {
        return NextResponse.redirect(new URL('/parent', request.url));
      }
      
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

  // For root path, redirect based on user role if authenticated, otherwise to login
  if (pathname === '/') {
    if (sessionToken) {
      try {
        // Check user role for proper redirection
        const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
          headers: {
            'Cookie': `session=${sessionToken}`
          }
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.user.roles?.includes('student') || sessionData.user.role === 'student') {
            return NextResponse.redirect(new URL('/student', request.url));
          }
          if (sessionData.user.roles?.includes('parent') || sessionData.user.roles?.includes('guardian') || sessionData.user.role === 'parent') {
            return NextResponse.redirect(new URL('/parent', request.url));
          }
          // Valid session for other users (teachers, admins, etc.)
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
          // Invalid session - clear cookie and redirect to login
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.set('session', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/'
          });
          return response;
        }
      } catch (error) {
        // Session validation failed - clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.set('session', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        });
        return response;
      }
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