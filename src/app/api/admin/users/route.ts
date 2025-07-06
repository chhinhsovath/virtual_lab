import { NextRequest } from 'next/server';
import { 
  withSuperAdmin, 
  withRateLimit, 
  getPaginationParams,
  successResponse,
  errorResponse,
  parseSearchFilters,
  validateEmail,
  withTransaction
} from '@/lib/super-admin-api';
import { pool } from '@/lib/db';
import { activityLogger } from '@/lib/activity-logger';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - List all users with pagination and filtering
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
            u.id,
            u.email,
            u.username,
            u.role,
            u.first_name,
            u.last_name,
            u.first_name_km,
            u.last_name_km,
            u.phone,
            u.is_active,
            u.created_at,
            u.updated_at,
            u.last_login_at,
            u.login_count,
            COALESCE(
              (SELECT COUNT(*) FROM user_sessions WHERE user_uuid = u.id AND expires_at > NOW()),
              0
            )::integer as active_sessions,
            COALESCE(
              (SELECT jsonb_agg(jsonb_build_object(
                'school_id', usa.school_id,
                'access_level', usa.access_level,
                'subjects', usa.subjects
              ))
              FROM user_school_access usa
              WHERE usa.user_id = u.id),
              '[]'::jsonb
            ) as school_access
          FROM users u
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
            u.first_name_km ILIKE $${paramIndex} OR
            u.last_name_km ILIKE $${paramIndex}
          )`;
          params.push(`%${search}%`);
          paramIndex++;
        }

        // Add filters
        if (filters.role) {
          query += ` AND u.role = $${paramIndex}`;
          params.push(filters.role);
          paramIndex++;
        }

        if (filters.is_active !== undefined) {
          query += ` AND u.is_active = $${paramIndex}`;
          params.push(filters.is_active === 'true');
          paramIndex++;
        }

        if (filters.has_active_session !== undefined) {
          if (filters.has_active_session === 'true') {
            query += ` AND EXISTS (SELECT 1 FROM user_sessions WHERE user_uuid = u.id AND expires_at > NOW())`;
          } else {
            query += ` AND NOT EXISTS (SELECT 1 FROM user_sessions WHERE user_uuid = u.id AND expires_at > NOW())`;
          }
        }

        // Count total records
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
        const countResult = await client.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering
        const validOrderColumns = ['email', 'username', 'role', 'created_at', 'last_login_at', 'login_count'];
        const orderColumn = validOrderColumns.includes(orderBy || '') ? orderBy : 'created_at';
        query += ` ORDER BY u.${orderColumn} ${orderDirection}`;

        // Add pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Execute main query
        const result = await client.query(query, params);

        // Get role statistics
        const roleStatsQuery = `
          SELECT role, COUNT(*) as count
          FROM users
          GROUP BY role
          ORDER BY count DESC
        `;
        const roleStats = await client.query(roleStatsQuery);

        return successResponse({
          users: result.rows,
          statistics: {
            roleDistribution: roleStats.rows
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

// POST /api/admin/users - Create a new user
export const POST = withSuperAdmin(
  withRateLimit(50)(
    async (request, context) => {
      const body = await request.json();

      // Validate required fields
      const requiredFields = ['email', 'password', 'role', 'first_name', 'last_name'];
      const missingFields = requiredFields.filter(field => !body[field]);
      
      if (missingFields.length > 0) {
        return errorResponse(
          'Missing required fields',
          400,
          { missingFields }
        );
      }

      // Validate email
      if (!validateEmail(body.email)) {
        return errorResponse('Invalid email address', 400);
      }

      // Validate role
      const validRoles = [
        'super_admin', 'admin', 'principal', 'teacher', 
        'assistant_teacher', 'librarian', 'counselor', 
        'student', 'parent', 'guardian', 'viewer'
      ];
      
      if (!validRoles.includes(body.role)) {
        return errorResponse(
          'Invalid role',
          400,
          { validRoles }
        );
      }

      // Super admin can only be created by another super admin
      if (body.role === 'super_admin' && context.user.role !== 'super_admin') {
        await activityLogger.logSecurityEvent(
          'ATTEMPTED_SUPER_ADMIN_CREATION',
          context.user.id,
          undefined,
          { attemptedByRole: context.user.role },
          'high'
        );
        return errorResponse('Insufficient permissions to create super admin', 403);
      }

      try {
        const result = await withTransaction(async (client) => {
          // Check if email already exists
          const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [body.email]
          );

          if (existingUser.rows.length > 0) {
            throw new Error('Email already exists');
          }

          // Hash password
          const passwordHash = await bcrypt.hash(body.password, 12);

          // Insert user
          const insertQuery = `
            INSERT INTO users (
              email, username, password_hash, role,
              first_name, last_name, first_name_km, last_name_km,
              phone, gender, date_of_birth, 
              teacher_id, is_active, avatar_url,
              created_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING *
          `;

          const insertResult = await client.query(insertQuery, [
            body.email,
            body.username || body.email.split('@')[0],
            passwordHash,
            body.role,
            body.first_name,
            body.last_name,
            body.first_name_km || null,
            body.last_name_km || null,
            body.phone || null,
            body.gender || null,
            body.date_of_birth || null,
            body.teacher_id || null,
            body.is_active !== false,
            body.avatar_url || null,
            context.user.id
          ]);

          const newUser = insertResult.rows[0];

          // Add school access if provided
          if (body.school_access && Array.isArray(body.school_access)) {
            for (const access of body.school_access) {
              await client.query(
                `INSERT INTO user_school_access (
                  user_id, school_id, access_level, subjects
                ) VALUES ($1, $2, $3, $4)`,
                [
                  newUser.id,
                  access.school_id,
                  access.access_level || 'read',
                  access.subjects || null
                ]
              );
            }
          }

          // Add initial permissions based on role
          const permissionTemplate = await client.query(
            'SELECT permissions FROM permission_templates WHERE role = $1 AND is_system = true',
            [body.role]
          );

          if (permissionTemplate.rows.length > 0) {
            const permissions = permissionTemplate.rows[0].permissions;
            for (const permission of permissions) {
              const [resource, action] = permission.split('.');
              if (resource && action) {
                await client.query(
                  `INSERT INTO user_permissions (
                    user_uuid, resource, action, granted_by
                  ) VALUES ($1, $2, $3, $4)`,
                  [newUser.id, resource, action, context.user.id]
                );
              }
            }
          }

          // Log user creation
          await activityLogger.logUserAction(
            'USER_CREATED',
            context.user.id,
            'users',
            newUser.id,
            {
              email: newUser.email,
              role: newUser.role,
              createdBy: context.user.email
            }
          );

          // Remove password hash from response
          delete newUser.password_hash;

          return newUser;
        });

        return successResponse({
          user: result,
          message: 'User created successfully'
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Email already exists') {
            return errorResponse('Email already exists', 409);
          }
          return errorResponse(error.message, 400);
        }
        throw error;
      }
    }
  )
);