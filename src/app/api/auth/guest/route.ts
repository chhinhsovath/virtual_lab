import { NextRequest, NextResponse } from 'next/server';
import { createGuestSession } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown';

    const { sessionToken, guestUser } = await createGuestSession(ipAddress, userAgent);

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: guestUser,
      sessionToken,
      message: 'Guest session created successfully'
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60, // 4 hours
      path: '/'
    });

    // Enhanced logging for guest session creation
    await logger.logGuestAction('session_created', {
      guestId: guestUser.id,
      ipAddress,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    }, sessionToken);

    await logger.logUserJourney('guest_session_start', 'guest', {
      guestId: guestUser.id,
      sessionDuration: '4 hours',
      permissions: guestUser.permissions.map(p => p.name)
    });

    return response;
  } catch (error) {
    await logger.error('Guest session creation failed', {
      error: error.message,
      stack: error.stack,
      userAgent: request.headers.get('user-agent'),
      ipAddress: forwardedFor?.split(',')[0] || realIP || 'unknown'
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
}