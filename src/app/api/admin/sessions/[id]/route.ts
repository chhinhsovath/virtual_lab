import { NextRequest } from 'next/server';
import { 
  withSuperAdmin, 
  withRateLimit, 
  successResponse,
  errorResponse,
  validateUUID
} from '@/lib/super-admin-api';
import { pool } from '@/lib/db';
import { activityLogger } from '@/lib/activity-logger';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/sessions/[id] - Get session details
export const GET = withSuperAdmin(
  withRateLimit(200)(
    async (request, context, { params }: RouteParams) => {
      const sessionId = params.id;

      if (!validateUUID(sessionId)) {
        return errorResponse('Invalid session ID format', 400);
      }

      const client = await pool.connect();
      try {
        // Get session details with user info
        const sessionQuery = `
          SELECT 
            s.id,
            s.session_token,
            s.user_uuid,
            s.expires_at,
            s.ip_address,
            s.user_agent,
            s.created_at,
            u.email,
            u.username,
            u.role,
            u.first_name,
            u.last_name,
            EXTRACT(EPOCH FROM (NOW() - s.created_at))::integer as session_duration_seconds,
            CASE 
              WHEN s.expires_at > NOW() THEN 'active'
              ELSE 'expired'
            END as status
          FROM user_sessions s
          INNER JOIN users u ON u.id = s.user_uuid
          WHERE s.id = $1
        `;

        const sessionResult = await client.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
          return errorResponse('Session not found', 404);
        }

        const session = sessionResult.rows[0];

        // Get session activity
        const activityQuery = `
          SELECT 
            action,
            resource_type,
            resource_id,
            status,
            duration_ms,
            created_at
          FROM activity_logs
          WHERE session_id = $1
          ORDER BY created_at DESC
          LIMIT 50
        `;

        const activityResult = await client.query(activityQuery, [session.session_token]);

        // Get activity summary
        const summaryQuery = `
          SELECT 
            COUNT(*) as total_actions,
            COUNT(*) FILTER (WHERE status = 'success') as successful_actions,
            COUNT(*) FILTER (WHERE status = 'failure') as failed_actions,
            COUNT(*) FILTER (WHERE status = 'error') as error_actions,
            AVG(duration_ms)::integer as avg_duration_ms,
            COUNT(DISTINCT resource_type) as unique_resources,
            COUNT(DISTINCT action) as unique_actions
          FROM activity_logs
          WHERE session_id = $1
        `;

        const summaryResult = await client.query(summaryQuery, [session.session_token]);

        // Parse user agent for better display
        const userAgentInfo = parseUserAgent(session.user_agent);

        return successResponse({
          session: {
            ...session,
            userAgent: userAgentInfo
          },
          activities: activityResult.rows,
          summary: summaryResult.rows[0]
        });
      } finally {
        client.release();
      }
    }
  )
);

// DELETE /api/admin/sessions/[id] - Terminate specific session
export const DELETE = withSuperAdmin(
  withRateLimit(50)(
    async (request, context, { params }: RouteParams) => {
      const sessionId = params.id;
      const body = await request.json().catch(() => ({}));

      if (!validateUUID(sessionId)) {
        return errorResponse('Invalid session ID format', 400);
      }

      const client = await pool.connect();
      try {
        // Get session details before deletion
        const sessionQuery = `
          SELECT 
            s.id,
            s.session_token,
            s.user_uuid,
            u.email,
            u.role
          FROM user_sessions s
          INNER JOIN users u ON u.id = s.user_uuid
          WHERE s.id = $1
        `;
        const sessionResult = await client.query(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
          return errorResponse('Session not found', 404);
        }

        const session = sessionResult.rows[0];

        // Check if trying to terminate own session
        if (session.user_uuid === context.user.id) {
          return errorResponse('Cannot terminate your own active session', 400);
        }

        // Check if trying to terminate another super admin's session
        if (session.role === 'super_admin' && context.user.role !== 'super_admin') {
          await activityLogger.logSecurityEvent(
            'ATTEMPTED_SUPER_ADMIN_SESSION_TERMINATION',
            context.user.id,
            undefined,
            { 
              targetUserId: session.user_uuid,
              targetRole: session.role
            },
            'high'
          );
          return errorResponse('Cannot terminate super admin sessions', 403);
        }

        // Delete session
        await client.query(
          'DELETE FROM user_sessions WHERE id = $1',
          [sessionId]
        );

        // Log termination
        await activityLogger.logUserAction(
          'SESSION_TERMINATED',
          context.user.id,
          'sessions',
          sessionId,
          {
            targetUserId: session.user_uuid,
            targetEmail: session.email,
            targetRole: session.role,
            reason: body.reason || 'Administrative action',
            terminatedBy: context.user.email
          }
        );

        // Send notification to user (if notification system is implemented)
        await client.query(
          `INSERT INTO notification_queue (
            recipient_id, notification_type, subject, message, priority
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            session.user_uuid,
            'session_terminated',
            'Session Terminated',
            `Your session was terminated by an administrator. Reason: ${body.reason || 'Security policy'}`,
            'high'
          ]
        ).catch(() => {}); // Don't fail if notifications table doesn't exist

        return successResponse({
          terminated: true,
          sessionId,
          userEmail: session.email,
          message: 'Session terminated successfully'
        });
      } finally {
        client.release();
      }
    }
  )
);

// Helper function to parse user agent
function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
  raw: string;
} {
  const ua = userAgent.toLowerCase();
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edge')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
  }

  // Detect device type
  let device = 'Desktop';
  if (ua.includes('mobile')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }

  return {
    browser,
    os,
    device,
    raw: userAgent
  };
}