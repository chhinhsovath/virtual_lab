import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '../../../../lib/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function handleLogout(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (sessionToken) {
      await deleteSession(sessionToken);
    }
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully logged out. You can now login with different credentials.' 
    });
    
    // Clear the session cookie
    response.cookies.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}