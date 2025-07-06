import { NextRequest } from 'next/server';
import { 
  withSuperAdmin, 
  withRateLimit, 
  successResponse,
  errorResponse,
  validateUUID,
  withTransaction,
  validateEmail
} from '@/lib/super-admin-api';
import { pool } from '@/lib/db';
import { activityLogger } from '@/lib/activity-logger';
import bcrypt from 'bcryptjs';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/users/[id] - Get user details
export const GET = withSuperAdmin(
  withRateLimit(200)(
    async (request, context, { params }: RouteParams) => {
      const userId = params.id;

      if (!validateUUID(userId)) {
        return errorResponse('Invalid user ID format', 400);
      }

      const client = await pool.connect();
      try {
        // Get user details
        const userQuery = `
          SELECT 
            u.*,
            COALESCE(
              (SELECT jsonb_agg(jsonb_build_object(
                'id', usa.id,
                'school_id', usa.school_id,
                'school_name', s.school_name,
                'school_name_kh', s.school_name_kh,
                'access_level', usa.access_level,
                'subjects', usa.subjects,
                'created_at', usa.created_at
              ))
              FROM user_school_access usa
              LEFT JOIN tbl_school_list s ON s.sclAutoID = usa.school_id
              WHERE usa.user_id = u.id),
              '[]'::jsonb
            ) as school_access,
            COALESCE(
              (SELECT jsonb_agg(jsonb_build_object(
                'resource', up.resource,
                'action', up.action,
                'school_id', up.school_id,
                'subject', up.subject
              ))
              FROM user_permissions up
              WHERE up.user_uuid = u.id),
              '[]'::jsonb
            ) as permissions,
            COALESCE(
              (SELECT jsonb_agg(jsonb_build_object(
                'session_token', us.session_token,
                'expires_at', us.expires_at,
                'ip_address', us.ip_address,
                'user_agent', us.user_agent,
                'created_at', us.created_at
              ))
              FROM user_sessions us
              WHERE us.user_uuid = u.id AND us.expires_at > NOW()
              ORDER BY us.created_at DESC),
              '[]'::jsonb
            ) as active_sessions,
            (
              SELECT COUNT(*)
              FROM activity_logs al
              WHERE al.user_id = u.id
            )::integer as total_activities,
            (
              SELECT al.created_at
              FROM activity_logs al
              WHERE al.user_id = u.id
              ORDER BY al.created_at DESC
              LIMIT 1
            ) as last_activity_at
          FROM users u
          WHERE u.id = $1
        `;

        const userResult = await client.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
          return errorResponse('User not found', 404);
        }

        const user = userResult.rows[0];

        // Get recent activities
        const activitiesQuery = `
          SELECT 
            action,
            resource_type,
            resource_id,
            status,
            ip_address,
            created_at
          FROM activity_logs
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 10
        `;

        const activitiesResult = await client.query(activitiesQuery, [userId]);

        // Remove sensitive data
        delete user.password_hash;

        return successResponse({
          user,
          recentActivities: activitiesResult.rows
        });
      } finally {
        client.release();
      }
    }
  )
);

// PUT /api/admin/users/[id] - Update user
export const PUT = withSuperAdmin(
  withRateLimit(50)(
    async (request, context, { params }: RouteParams) => {
      const userId = params.id;
      const body = await request.json();

      if (!validateUUID(userId)) {
        return errorResponse('Invalid user ID format', 400);
      }

      // Validate email if provided
      if (body.email && !validateEmail(body.email)) {
        return errorResponse('Invalid email address', 400);
      }

      // Prevent role escalation
      if (body.role === 'super_admin' && context.user.role !== 'super_admin') {
        await activityLogger.logSecurityEvent(
          'ATTEMPTED_ROLE_ESCALATION',
          context.user.id,
          undefined,
          { 
            targetUserId: userId,
            attemptedRole: 'super_admin',
            currentUserRole: context.user.role
          },
          'high'
        );
        return errorResponse('Insufficient permissions to assign super admin role', 403);
      }

      try {
        const result = await withTransaction(async (client) => {
          // Check if user exists
          const existingUser = await client.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [userId]
          );

          if (existingUser.rows.length === 0) {
            throw new Error('User not found');
          }

          const oldUser = existingUser.rows[0];

          // Build update query dynamically
          const updateFields: string[] = [];
          const updateValues: any[] = [];
          let paramIndex = 1;

          const allowedFields = [
            'email', 'username', 'role', 'first_name', 'last_name',
            'first_name_km', 'last_name_km', 'phone', 'gender',
            'date_of_birth', 'is_active', 'avatar_url'
          ];

          for (const field of allowedFields) {
            if (body.hasOwnProperty(field)) {
              updateFields.push(`${field} = $${paramIndex}`);
              updateValues.push(body[field]);
              paramIndex++;
            }
          }

          // Handle password update separately
          if (body.password) {
            const passwordHash = await bcrypt.hash(body.password, 12);
            updateFields.push(`password_hash = $${paramIndex}`);
            updateValues.push(passwordHash);
            paramIndex++;
          }

          if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
          }

          // Add updated_at and updated_by
          updateFields.push(`updated_at = NOW()`);
          updateFields.push(`updated_by = $${paramIndex}`);
          updateValues.push(context.user.id);
          paramIndex++;

          // Add user ID for WHERE clause
          updateValues.push(userId);

          const updateQuery = `
            UPDATE users
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
          `;

          const updateResult = await client.query(updateQuery, updateValues);
          const updatedUser = updateResult.rows[0];

          // Handle school access updates
          if (body.school_access !== undefined) {
            // Remove existing access
            await client.query(
              'DELETE FROM user_school_access WHERE user_id = $1',
              [userId]
            );

            // Add new access
            if (Array.isArray(body.school_access)) {
              for (const access of body.school_access) {
                await client.query(
                  `INSERT INTO user_school_access (
                    user_id, school_id, access_level, subjects
                  ) VALUES ($1, $2, $3, $4)`,
                  [
                    userId,
                    access.school_id,
                    access.access_level || 'read',
                    access.subjects || null
                  ]
                );
              }
            }
          }

          // Log changes
          const changes: Record<string, any> = {};
          for (const field of allowedFields) {
            if (body.hasOwnProperty(field) && oldUser[field] !== body[field]) {
              changes[field] = {
                old: oldUser[field],
                new: body[field]
              };
            }
          }

          await activityLogger.logUserAction(
            'USER_UPDATED',
            context.user.id,
            'users',
            userId,
            {
              changes,
              updatedBy: context.user.email
            }
          );

          // Force logout if critical fields changed
          if (body.role !== undefined || body.is_active === false || body.password) {
            await client.query(
              'DELETE FROM user_sessions WHERE user_uuid = $1',
              [userId]
            );

            await activityLogger.logUserAction(
              'USER_SESSIONS_TERMINATED',
              context.user.id,
              'users',
              userId,
              {
                reason: 'Critical user data updated',
                updatedBy: context.user.email
              }
            );
          }

          // Remove password hash from response
          delete updatedUser.password_hash;

          return updatedUser;
        });

        return successResponse({
          user: result,
          message: 'User updated successfully'
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'User not found') {
            return errorResponse('User not found', 404);
          }
          return errorResponse(error.message, 400);
        }
        throw error;
      }
    }
  )
);

// DELETE /api/admin/users/[id] - Delete or deactivate user
export const DELETE = withSuperAdmin(
  withRateLimit(20)(
    async (request, context, { params }: RouteParams) => {
      const userId = params.id;
      const { searchParams } = new URL(request.url);
      const hardDelete = searchParams.get('hard') === 'true';

      if (!validateUUID(userId)) {
        return errorResponse('Invalid user ID format', 400);
      }

      // Prevent self-deletion
      if (userId === context.user.id) {
        return errorResponse('Cannot delete your own account', 400);
      }

      try {
        const result = await withTransaction(async (client) => {
          // Check if user exists
          const existingUser = await client.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [userId]
          );

          if (existingUser.rows.length === 0) {
            throw new Error('User not found');
          }

          const user = existingUser.rows[0];

          // Prevent deletion of other super admins unless by super admin
          if (user.role === 'super_admin' && context.user.role !== 'super_admin') {
            await activityLogger.logSecurityEvent(
              'ATTEMPTED_SUPER_ADMIN_DELETION',
              context.user.id,
              undefined,
              { 
                targetUserId: userId,
                targetUserRole: user.role
              },
              'critical'
            );
            return errorResponse('Cannot delete super admin user', 403);
          }

          if (hardDelete) {
            // Permanently delete user and related data
            
            // Delete sessions
            await client.query(
              'DELETE FROM user_sessions WHERE user_uuid = $1',
              [userId]
            );

            // Delete permissions
            await client.query(
              'DELETE FROM user_permissions WHERE user_uuid = $1',
              [userId]
            );

            // Delete school access
            await client.query(
              'DELETE FROM user_school_access WHERE user_id = $1',
              [userId]
            );

            // Delete user
            await client.query(
              'DELETE FROM users WHERE id = $1',
              [userId]
            );

            await activityLogger.logUserAction(
              'USER_DELETED',
              context.user.id,
              'users',
              userId,
              {
                email: user.email,
                role: user.role,
                deletedBy: context.user.email,
                hardDelete: true
              }
            );

            return { deleted: true, userId };
          } else {
            // Soft delete - deactivate user
            await client.query(
              `UPDATE users 
               SET is_active = false, 
                   updated_at = NOW(),
                   updated_by = $2
               WHERE id = $1`,
              [userId, context.user.id]
            );

            // Terminate all sessions
            await client.query(
              'DELETE FROM user_sessions WHERE user_uuid = $1',
              [userId]
            );

            await activityLogger.logUserAction(
              'USER_DEACTIVATED',
              context.user.id,
              'users',
              userId,
              {
                email: user.email,
                role: user.role,
                deactivatedBy: context.user.email
              }
            );

            return { deactivated: true, userId };
          }
        });

        return successResponse({
          ...result,
          message: hardDelete ? 'User deleted successfully' : 'User deactivated successfully'
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'User not found') {
            return errorResponse('User not found', 404);
          }
          return errorResponse(error.message, 400);
        }
        throw error;
      }
    }
  )
);