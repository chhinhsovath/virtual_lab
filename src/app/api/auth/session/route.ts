import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      );
    }
    
    const session = await getSession(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
        roles: session.user.roles,
        permissions: session.user.permissions.map(p => p.name),
        schoolAccess: session.user.schoolAccess,
        teacherId: session.user.teacherId,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}