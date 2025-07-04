import { pool } from './db';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import type { User, SchoolAccess } from '@/types/auth';

// Re-export User type from types file
export type { User, SchoolAccess } from '@/types/auth';

export interface Permission {
  name: string;
  resource: string;
  action: string;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  user: User;
}

/**
 * Authenticate user with username/password
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    // Get user with roles and permissions
    const userQuery = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.password_hash,
        u.is_active,
        u.teacher_id,
        COALESCE(
          JSON_AGG(
            DISTINCT r.name
          ) FILTER (WHERE r.id IS NOT NULL), '[]'
        ) as roles,
        COALESCE(
          JSON_AGG(
            DISTINCT jsonb_build_object(
              'name', p.name,
              'resource', p.resource,
              'action', p.action
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
      LEFT JOIN roles r ON ur.role_id = r.id AND r.is_active = true
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.username = $1 AND u.is_active = true
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.password_hash, u.is_active, u.teacher_id
    `;

    const userResult = await client.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      return null;
    }

    const userData = userResult.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);
    if (!passwordMatch) {
      return null;
    }

    // Get school access
    const schoolAccessQuery = `
      SELECT 
        school_id,
        access_type,
        subject
      FROM user_school_access 
      WHERE user_id = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const schoolAccessResult = await client.query(schoolAccessQuery, [userData.id]);

    // Update last login
    await client.query(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [userData.id]
    );

    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      name: `${userData.first_name} ${userData.last_name}`.trim(),
      role: userData.roles?.[0] || 'user',
      firstName: userData.first_name,
      lastName: userData.last_name,
      phoneNumber: userData.phone,
      isActive: userData.is_active,
      teacherId: userData.teacher_id,
      roles: userData.roles || [],
      createdAt: new Date(),
      schoolAccess: schoolAccessResult.rows.map(row => ({
        schoolId: row.school_id,
        accessType: row.access_type,
        subject: row.subject
      })),
      permissions: userData.permissions || []
    };

  } finally {
    client.release();
  }
}

/**
 * Create user session
 */
export async function createSession(user: User, ipAddress?: string, userAgent?: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [user.id, sessionToken, ipAddress, userAgent, expiresAt]);

    // Log login activity
    await logUserActivity(user.id, 'login', 'session', sessionToken, {
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return sessionToken;
  } finally {
    client.release();
  }
}

/**
 * Get session with user data
 */
export async function getSession(sessionToken: string): Promise<Session | null> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT 
        s.id as session_id,
        s.user_id,
        s.session_token,
        s.expires_at,
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.is_active,
        u.teacher_id,
        COALESCE(
          JSON_AGG(
            DISTINCT r.name
          ) FILTER (WHERE r.id IS NOT NULL), '[]'
        ) as roles,
        COALESCE(
          JSON_AGG(
            DISTINCT jsonb_build_object(
              'name', p.name,
              'resource', p.resource,
              'action', p.action
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as permissions
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
      LEFT JOIN roles r ON ur.role_id = r.id AND r.is_active = true
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE s.session_token = $1 
        AND s.is_active = true 
        AND s.expires_at > NOW()
        AND u.is_active = true
      GROUP BY s.id, s.user_id, s.session_token, s.expires_at, u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.teacher_id
    `;

    const result = await client.query(query, [sessionToken]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Get school access
    const schoolAccessQuery = `
      SELECT 
        school_id,
        access_type,
        subject
      FROM user_school_access 
      WHERE user_id = $1 AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    `;

    const schoolAccessResult = await client.query(schoolAccessQuery, [row.user_id]);

    // Update last accessed
    await client.query(
      'UPDATE user_sessions SET last_accessed_at = NOW() WHERE id = $1',
      [row.session_id]
    );

    const user: User = {
      id: row.id,
      username: row.username,
      email: row.email,
      name: `${row.first_name} ${row.last_name}`.trim(),
      role: row.roles?.[0] || 'user',
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone,
      isActive: row.is_active,
      teacherId: row.teacher_id,
      roles: row.roles || [],
      createdAt: new Date(),
      schoolAccess: schoolAccessResult.rows.map(accessRow => ({
        schoolId: accessRow.school_id,
        accessType: accessRow.access_type,
        subject: accessRow.subject
      })),
      permissions: row.permissions || []
    };

    return {
      id: row.session_id,
      userId: row.user_id,
      sessionToken: row.session_token,
      expiresAt: new Date(row.expires_at),
      user
    };

  } finally {
    client.release();
  }
}

/**
 * Destroy session
 */
export async function destroySession(sessionToken: string): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1 RETURNING user_id',
      [sessionToken]
    );

    if (result.rows.length > 0) {
      await logUserActivity(result.rows[0].user_id, 'logout', 'session', sessionToken);
    }
  } finally {
    client.release();
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, resource: string, action: string): boolean {
  return user.permissions.some(p => 
    p === `${resource}.${action}`
  );
}

/**
 * Check if user has role
 */
export function hasRole(user: User, roleName: string): boolean {
  return user.roles?.includes(roleName) || user.role === roleName || false;
}

/**
 * Get accessible school IDs for user
 */
export function getAccessibleSchoolIds(user: User, requiredAccess: 'read' | 'write' | 'admin' = 'read'): number[] {
  const accessLevels = { read: 1, write: 2, admin: 3 };
  const requiredLevel = accessLevels[requiredAccess];

  return user.schoolAccess
    .filter(access => accessLevels[access.accessType] >= requiredLevel)
    .map(access => access.schoolId);
}

/**
 * Check if user can access school
 */
export function canAccessSchool(user: User, schoolId: number, requiredAccess: 'read' | 'write' | 'admin' = 'read'): boolean {
  return getAccessibleSchoolIds(user, requiredAccess).includes(schoolId);
}

/**
 * Log user activity
 */
export async function logUserActivity(
  userId: string, 
  action: string, 
  resource?: string, 
  resourceId?: string, 
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO user_activity_log (user_id, action, resource, resource_id, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, resource, resourceId, JSON.stringify(details || {}), ipAddress, userAgent]);
  } finally {
    client.release();
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE user_sessions SET is_active = false WHERE expires_at <= NOW() AND is_active = true'
    );
  } finally {
    client.release();
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `, [userId, token, expiresAt]);

    return token;
  } finally {
    client.release();
  }
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT user_id 
      FROM password_reset_tokens 
      WHERE token = $1 
        AND expires_at > NOW() 
        AND used_at IS NULL
    `, [token]);

    return result.rows.length > 0 ? result.rows[0].user_id : null;
  } finally {
    client.release();
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify token
    const tokenResult = await client.query(`
      SELECT user_id 
      FROM password_reset_tokens 
      WHERE token = $1 
        AND expires_at > NOW() 
        AND used_at IS NULL
    `, [token]);

    if (tokenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const userId = tokenResult.rows[0].user_id;
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
      WHERE id = $2
    `, [hashedPassword, userId]);

    // Mark token as used
    await client.query(`
      UPDATE password_reset_tokens 
      SET used_at = NOW() 
      WHERE token = $1
    `, [token]);

    // Invalidate all user sessions
    await client.query(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE user_id = $1
    `, [userId]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}