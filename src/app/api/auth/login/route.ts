import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession } from '../../../../lib/auth';
import { getLanguageFromRequest, errorResponse, getLocalizedMessage } from '../../../../lib/api-responses';

export async function POST(request: NextRequest) {
  const language = getLanguageFromRequest(request);
  
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        errorResponse('usernamePasswordRequired', language),
        { status: 400 }
      );
    }

    // Authenticate user with new system
    const user = await authenticateUser(username, password);
    
    if (!user) {
      return NextResponse.json(
        errorResponse('invalidCredentials', language),
        { status: 401 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session
    const sessionToken = await createSession(user, ipAddress, userAgent);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions.map((p: any) => p.name),
        schoolAccess: user.schoolAccess,
        teacherId: user.teacherId,
      },
    });

    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
      // Domain is omitted to allow the cookie to work on the specific subdomain
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      errorResponse('internalServerError', language),
      { status: 500 }
    );
  }
}