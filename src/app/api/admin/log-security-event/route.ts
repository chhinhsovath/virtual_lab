import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { activityLogger } from '@/lib/activity-logger';
import { successResponse } from '@/lib/super-admin-api';

// POST /api/admin/log-security-event - Log security events (used by middleware)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession(request);
    
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip') ||
                     'unknown';

    await activityLogger.logSecurityEvent(
      body.action || 'UNKNOWN_SECURITY_EVENT',
      body.userId || session?.user?.id,
      ipAddress,
      {
        ...body,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      body.severity || 'medium'
    );

    return successResponse({ logged: true });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't return error - logging failures shouldn't break the application
    return successResponse({ logged: false });
  }
}