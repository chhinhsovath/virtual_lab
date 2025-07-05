import { pool } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { User, SchoolAccess } from '../types/auth';

// Re-export User type from types file
export type { User, SchoolAccess } from '../types/auth';

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
 * Authenticate user with username/password (supports email as username)
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    // Simple query for current users table structure
    const userQuery = `
      SELECT 
        id,
        email,
        name,
        role,
        password_hash,
        is_active
      FROM users 
      WHERE email = $1 AND is_active = true
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

    // Update last login (using correct column name for production)
    await client.query(
      'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
      [userData.id]
    );

    // Parse name into first/last name
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: userData.id,
      username: userData.email, // Use email as username
      email: userData.email,
      name: userData.name,
      role: userData.role,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: null,
      isActive: userData.is_active,
      teacherId: null,
      roles: [userData.role],
      createdAt: new Date(),
      schoolAccess: [], // No school access for simplified system
      permissions: [] // No complex permissions for simplified system
    };

  } finally {
    client.release();
  }
}

/**
 * Create user session (working implementation)
 */
export async function createSession(user: User, ipAddress?: string, userAgent?: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const client = await pool.connect();
  
  try {
    // Insert session using existing user_sessions table structure
    await client.query(`
      INSERT INTO user_sessions (user_uuid, session_token, user_role, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '24 hours')
    `, [user.id, sessionToken, user.role, ipAddress, userAgent]);

    return sessionToken;
  } finally {
    client.release();
  }
}

/**
 * Get session with user data (working implementation)
 */
export async function getSession(sessionToken: string): Promise<Session | null> {
  if (!sessionToken) {
    return null;
  }

  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        s.id, s.user_uuid, s.session_token, s.expires_at,
        u.id as user_id, u.email, u.name, u.role, u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_uuid = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW() AND u.is_active = true
    `, [sessionToken]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const nameParts = row.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: row.id,
      userId: row.user_id,
      sessionToken: row.session_token,
      expiresAt: new Date(row.expires_at),
      user: {
        id: row.user_id,
        username: row.email,
        email: row.email,
        name: row.name,
        role: row.role,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: null,
        isActive: row.is_active,
        teacherId: null,
        roles: [row.role],
        createdAt: new Date(),
        schoolAccess: [],
        permissions: []
      }
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
    await client.query(
      'DELETE FROM user_sessions WHERE session_token = $1',
      [sessionToken]
    );
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
 * Log user activity (simplified for production)
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
  // For production, we'll skip activity logging to avoid database dependencies
  // This can be implemented later when the full schema is available
  console.log(`User activity: ${userId} - ${action} - ${resource} - ${resourceId}`);
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