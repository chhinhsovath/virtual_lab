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
    // First check if user exists by username or email
    const userQuery = `
      SELECT 
        id,
        COALESCE(username, email) as username,
        email,
        name,
        role,
        password_hash,
        COALESCE(is_active, true) as is_active
      FROM users 
      WHERE (username = $1 OR email = $1) AND COALESCE(is_active, true) = true
    `;

    const userResult = await client.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found:', username);
      return null;
    }

    const userData = userResult.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);
    if (!passwordMatch) {
      console.log('Password mismatch for user:', username);
      return null;
    }

    // Update last login if column exists
    try {
      await client.query(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
        [userData.id]
      );
    } catch (updateError) {
      // Ignore if columns don't exist
      console.log('Could not update last_login, columns might not exist');
    }

    // Parse name into first/last name
    const nameParts = (userData.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: userData.id,
      username: userData.username || userData.email,
      email: userData.email,
      name: userData.name || '',
      role: userData.role,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: null,
      isActive: userData.is_active,
      teacherId: null,
      roles: [userData.role],
      createdAt: new Date(),
      schoolAccess: [],
      permissions: []
    };

  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Create user session (handles both user_id and user_uuid columns)
 */
export async function createSession(user: User, ipAddress?: string, userAgent?: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const client = await pool.connect();
  
  try {
    // First, check which column exists
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      AND column_name IN ('user_id', 'user_uuid')
    `;
    
    const columnResult = await client.query(columnCheckQuery);
    const userColumn = columnResult.rows.length > 0 ? columnResult.rows[0].column_name : 'user_id';
    
    // Insert session using the correct column name
    const insertQuery = `
      INSERT INTO user_sessions (${userColumn}, session_token, user_role, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '24 hours')
    `;
    
    await client.query(insertQuery, [user.id, sessionToken, user.role, ipAddress, userAgent]);

    return sessionToken;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get session with user data (handles both column names)
 */
export async function getSession(sessionToken: string): Promise<Session | null> {
  if (!sessionToken) {
    return null;
  }

  const client = await pool.connect();
  try {
    // First check which column exists
    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_sessions' 
      AND column_name IN ('user_id', 'user_uuid')
    `;
    
    const columnResult = await client.query(columnCheckQuery);
    const userColumn = columnResult.rows.length > 0 ? columnResult.rows[0].column_name : 'user_id';

    const sessionQuery = `
      SELECT 
        s.id, s.${userColumn} as user_id, s.session_token, s.expires_at,
        u.id as u_id, u.email, u.name, u.role, COALESCE(u.is_active, true) as is_active
      FROM user_sessions s
      JOIN users u ON s.${userColumn} = u.id
      WHERE s.session_token = $1 AND s.expires_at > NOW() AND COALESCE(u.is_active, true) = true
    `;

    const result = await client.query(sessionQuery, [sessionToken]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const nameParts = (row.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: row.id,
      userId: row.u_id.toString(),
      sessionToken: row.session_token,
      expiresAt: new Date(row.expires_at),
      user: {
        id: row.u_id,
        username: row.email,
        email: row.email,
        name: row.name || '',
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
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  } finally {
    client.release();
  }
}

/**
 * Delete session
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM user_sessions WHERE session_token = $1', [sessionToken]);
  } finally {
    client.release();
  }
}

/**
 * Check if user has role
 */
export function hasRole(user: User, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Check if user has permission
 */
export function hasPermission(user: User, resource: string, action: string): boolean {
  // For simplified system, check based on role
  if (user.role === 'admin') return true;
  if (user.role === 'teacher' && ['read', 'write'].includes(action)) return true;
  if (user.role === 'student' && action === 'read') return true;
  return false;
}

/**
 * Check if user can access school
 */
export function canAccessSchool(user: User, schoolId: number, requiredLevel: 'read' | 'write' | 'admin' = 'read'): boolean {
  // For simplified system, allow access based on role
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return requiredLevel !== 'admin';
  if (user.role === 'student') return requiredLevel === 'read';
  return false;
}