import { NextRequest } from 'next/server';
import { 
  withSuperAdmin, 
  withRateLimit, 
  getPaginationParams,
  successResponse,
  errorResponse,
  parseSearchFilters
} from '@/lib/super-admin-api';
import { pool } from '@/lib/db';
import { activityLogger } from '@/lib/activity-logger';

// GET /api/admin/sessions - List all active sessions
export const GET = withSuperAdmin(
  withRateLimit(100)(
    async (request, context) => {
      const { searchParams } = new URL(request.url);
      const { page, limit, offset } = getPaginationParams(searchParams);
      const { search, filters, orderBy, orderDirection } = parseSearchFilters(searchParams);

      const client = await pool.connect();
      try {
        // Build query
        let query = `
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
            END as status,
            (
              SELECT COUNT(*)
              FROM activity_logs al
              WHERE al.session_id = s.session_token
              AND al.created_at >= s.created_at
            )::integer as activity_count,
            (
              SELECT MAX(al.created_at)
              FROM activity_logs al
              WHERE al.session_id = s.session_token
            ) as last_activity_at
          FROM user_sessions s
          INNER JOIN users u ON u.id = s.user_uuid
          WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        // Add search filter
        if (search) {
          query += ` AND (
            u.email ILIKE $${paramIndex} OR 
            u.username ILIKE $${paramIndex} OR 
            u.first_name ILIKE $${paramIndex} OR 
            u.last_name ILIKE $${paramIndex} OR
            s.ip_address::text ILIKE $${paramIndex}
          )`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        // Add filters
        if (filters.status === 'active') {
          query += ` AND s.expires_at > NOW()`;
        } else if (filters.status === 'expired') {
          query += ` AND s.expires_at <= NOW()`;
        }

        if (filters.role) {
          query += ` AND u.role = $${paramIndex}`;
          params.push(filters.role);
          paramIndex++;
        }

        if (filters.user_id) {
          query += ` AND s.user_uuid = $${paramIndex}`;
          params.push(filters.user_id);
          paramIndex++;
        }

        if (filters.ip_address) {
          query += ` AND s.ip_address = $${paramIndex}::inet`;
          params.push(filters.ip_address);
          paramIndex++;
        }

        // Count total records
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
        const countResult = await client.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering
        const validOrderColumns = ['created_at', 'expires_at', 'email', 'role', 'last_activity_at'];
        const orderColumn = validOrderColumns.includes(orderBy || '') ? orderBy : 'created_at';
        
        if (orderColumn === 'last_activity_at') {
          query = `SELECT * FROM (${query}) as sessions ORDER BY ${orderColumn} ${orderDirection} NULLS LAST`;
        } else {
          query += ` ORDER BY ${orderColumn === 'email' || orderColumn === 'role' ? 'u' : 's'}.${orderColumn} ${orderDirection}`;
        }

        // Add pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Execute main query
        const result = await client.query(query, params);

        // Get session statistics
        const statsQuery = `
          SELECT 
            COUNT(*) FILTER (WHERE expires_at > NOW()) as active_sessions,
            COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_sessions,
            COUNT(DISTINCT user_uuid) as unique_users,
            COUNT(DISTINCT ip_address) as unique_ips,
            AVG(EXTRACT(EPOCH FROM (COALESCE(expires_at, NOW()) - created_at)))::integer as avg_session_duration
          FROM user_sessions
          WHERE created_at >= NOW() - INTERVAL '24 hours'
        `;
        const statsResult = await client.query(statsQuery);

        // Get sessions by role
        const roleStatsQuery = `
          SELECT 
            u.role,
            COUNT(*) as session_count
          FROM user_sessions s
          INNER JOIN users u ON u.id = s.user_uuid
          WHERE s.expires_at > NOW()
          GROUP BY u.role
          ORDER BY session_count DESC
        `;
        const roleStats = await client.query(roleStatsQuery);

        return successResponse({
          sessions: result.rows,
          statistics: {
            ...statsResult.rows[0],
            sessionsByRole: roleStats.rows
          }
        }, {
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        });
      } finally {
        client.release();
      }
    }
  )
);

// DELETE /api/admin/sessions - Bulk terminate sessions
export const DELETE = withSuperAdmin(
  withRateLimit(20)(
    async (request, context) => {
      const body = await request.json();
      
      if (!body.sessionIds || !Array.isArray(body.sessionIds)) {
        return errorResponse('Session IDs must be provided as an array', 400);
      }

      if (body.sessionIds.length === 0) {
        return errorResponse('No session IDs provided', 400);
      }

      if (body.sessionIds.length > 100) {
        return errorResponse('Cannot terminate more than 100 sessions at once', 400);
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

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
          WHERE s.id = ANY($1::uuid[])
        `;
        const sessionsResult = await client.query(sessionQuery, [body.sessionIds]);

        if (sessionsResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return errorResponse('No valid sessions found', 404);
        }

        // Check if trying to terminate own session
        const ownSession = sessionsResult.rows.find(
          session => session.user_uuid === context.user.id
        );
        if (ownSession) {
          await client.query('ROLLBACK');
          return errorResponse('Cannot terminate your own active session', 400);
        }

        // Delete sessions
        const deleteResult = await client.query(
          'DELETE FROM user_sessions WHERE id = ANY($1::uuid[]) RETURNING id',
          [body.sessionIds]
        );

        // Log each terminated session
        for (const session of sessionsResult.rows) {
          await activityLogger.logUserAction(
            'SESSION_TERMINATED',
            context.user.id,
            'sessions',
            session.id,
            {
              targetUserId: session.user_uuid,
              targetEmail: session.email,
              targetRole: session.role,
              reason: body.reason || 'Administrative action',
              terminatedBy: context.user.email
            }
          );
        }

        await client.query('COMMIT');

        return successResponse({
          terminatedCount: deleteResult.rowCount,
          terminatedSessions: sessionsResult.rows.map(s => ({
            id: s.id,
            userEmail: s.email,
            userRole: s.role
          })),
          message: `Successfully terminated ${deleteResult.rowCount} session(s)`
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
  )
);