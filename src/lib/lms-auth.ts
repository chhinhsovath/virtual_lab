import { pool } from './db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface LMSUser {
  id: string;
  email: string;
  name: string;
  lms_role_id: string;
  role_name: string;
  preferred_language: string;
  avatar_url?: string;
  phone_number?: string;
  schools?: string[];
  permissions?: string[];
}

export interface LMSSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  last_activity: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface Permission {
  resource: string;
  action: string;
}

// Get user with LMS role and permissions
export async function getLMSUser(userId: string): Promise<LMSUser | null> {
  const client = await pool.connect();
  try {
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.lms_role_id,
        r.name as role_name,
        u.preferred_language,
        u.avatar_url,
        u.phone_number,
        COALESCE(
          ARRAY_AGG(DISTINCT s.school_name) FILTER (WHERE s.school_name IS NOT NULL),
          ARRAY[]::text[]
        ) as schools
      FROM users u
      LEFT JOIN lms_roles r ON u.lms_role_id = r.id
      LEFT JOIN user_school_access usa ON u.id = usa.user_id
      LEFT JOIN tbl_school_list s ON usa.school_id = s.school_id
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.name, u.lms_role_id, r.name, 
               u.preferred_language, u.avatar_url, u.phone_number
    `;
    
    const result = await client.query(userQuery, [userId]);
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    
    // Get permissions
    const permissionsQuery = `
      SELECT 
        res.name as resource,
        p.action
      FROM lms_role_permissions rp
      JOIN lms_permissions p ON rp.permission_id = p.id
      JOIN lms_resources res ON p.resource_id = res.id
      WHERE rp.role_id = $1
    `;
    
    const permissionsResult = await client.query(permissionsQuery, [user.lms_role_id]);
    const permissions = permissionsResult.rows.map(row => `${row.resource}:${row.action}`);
    
    return {
      ...user,
      permissions
    };
  } finally {
    client.release();
  }
}

// Check if user has specific permission
export async function hasLMSPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM users u
        JOIN lms_role_permissions rp ON u.lms_role_id = rp.role_id
        JOIN lms_permissions p ON rp.permission_id = p.id
        JOIN lms_resources r ON p.resource_id = r.id
        WHERE u.id = $1
        AND r.name = $2
        AND p.action = $3
      ) as has_permission
    `;
    
    const result = await client.query(query, [userId, resource, action]);
    return result.rows[0].has_permission;
  } finally {
    client.release();
  }
}

// Check if user has any of the specified roles
export async function hasLMSRole(userId: string, roleNames: string[]): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM users u
        JOIN lms_roles r ON u.lms_role_id = r.id
        WHERE u.id = $1
        AND r.name = ANY($2)
      ) as has_role
    `;
    
    const result = await client.query(query, [userId, roleNames]);
    return result.rows[0].has_role;
  } finally {
    client.release();
  }
}

// Get user's courses (as teacher or student)
export async function getUserCourses(userId: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT DISTINCT
        c.id,
        c.code,
        c.title,
        c.title_km,
        c.description,
        c.start_date,
        c.end_date,
        c.is_active,
        CASE 
          WHEN cs.instructor_id = $1 THEN 'instructor'
          WHEN ce.student_id = $1 THEN 'student'
          ELSE 'other'
        END as user_role
      FROM lms_courses c
      LEFT JOIN lms_course_schedules cs ON c.id = cs.course_id AND cs.instructor_id = $1
      LEFT JOIN lms_course_enrollments ce ON c.id = ce.course_id AND ce.student_id = $1
      WHERE (cs.instructor_id = $1 OR ce.student_id = $1)
      AND c.is_active = true
      ORDER BY c.start_date DESC
    `;
    
    const result = await client.query(query, [userId]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Check if user can access specific course
export async function canAccessCourse(
  userId: string, 
  courseId: string, 
  requiredAccess: 'read' | 'write' | 'admin' = 'read'
): Promise<boolean> {
  const client = await pool.connect();
  try {
    // Super admin and admin can access all courses
    const isAdmin = await hasLMSRole(userId, ['super_admin', 'admin']);
    if (isAdmin) return true;
    
    // Check if user is instructor
    const instructorQuery = `
      SELECT EXISTS (
        SELECT 1 FROM lms_course_schedules
        WHERE course_id = $1 AND instructor_id = $2
      ) as is_instructor
    `;
    const instructorResult = await client.query(instructorQuery, [courseId, userId]);
    if (instructorResult.rows[0].is_instructor) return true;
    
    // Check if user is enrolled student
    if (requiredAccess === 'read') {
      const enrollmentQuery = `
        SELECT EXISTS (
          SELECT 1 FROM lms_course_enrollments
          WHERE course_id = $1 AND student_id = $2
          AND status IN ('enrolled', 'completed')
        ) as is_enrolled
      `;
      const enrollmentResult = await client.query(enrollmentQuery, [courseId, userId]);
      if (enrollmentResult.rows[0].is_enrolled) return true;
    }
    
    // Check if parent/guardian of enrolled student
    if (requiredAccess === 'read') {
      const parentQuery = `
        SELECT EXISTS (
          SELECT 1 
          FROM lms_parent_students ps
          JOIN lms_course_enrollments ce ON ps.student_id = ce.student_id
          WHERE ps.parent_id = $1 
          AND ce.course_id = $2
          AND ce.status IN ('enrolled', 'completed')
        ) as is_parent
      `;
      const parentResult = await client.query(parentQuery, [userId, courseId]);
      return parentResult.rows[0].is_parent;
    }
    
    return false;
  } finally {
    client.release();
  }
}

// Log user activity
export async function logActivity(
  userId: string,
  activityType: string,
  action: string,
  details?: any,
  resourceType?: string,
  resourceId?: string
) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO lms_activity_logs 
      (user_id, activity_type, action, details, resource_type, resource_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await client.query(query, [
      userId,
      activityType,
      action,
      details ? JSON.stringify(details) : null,
      resourceType,
      resourceId
    ]);
  } finally {
    client.release();
  }
}

// Get session with LMS user data
export async function getLMSSession(token?: string): Promise<(LMSSession & { user: LMSUser }) | null> {
  if (!token) {
    const cookieStore = cookies();
    token = cookieStore.get('virtual_lab_session')?.value;
  }
  
  if (!token) return null;
  
  const client = await pool.connect();
  try {
    const sessionQuery = `
      SELECT 
        s.*,
        u.id as user_id,
        u.email,
        u.name,
        u.lms_role_id,
        r.name as role_name,
        u.preferred_language,
        u.avatar_url,
        u.phone_number
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN lms_roles r ON u.lms_role_id = r.id
      WHERE s.token = $1 
      AND s.expires_at > NOW()
    `;
    
    const result = await client.query(sessionQuery, [token]);
    if (result.rows.length === 0) return null;
    
    const session = result.rows[0];
    const user = await getLMSUser(session.user_id);
    
    if (!user) return null;
    
    // Update last activity
    await client.query(
      'UPDATE user_sessions SET last_activity = NOW() WHERE token = $1',
      [token]
    );
    
    return {
      id: session.id,
      user_id: session.user_id,
      token: session.token,
      expires_at: session.expires_at,
      created_at: session.created_at,
      last_activity: session.last_activity,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      user
    };
  } finally {
    client.release();
  }
}

// Enhanced login with role assignment
export async function lmsLogin(
  email: string, 
  password: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ user: LMSUser; token: string } | null> {
  const client = await pool.connect();
  try {
    // Get user with role
    const userQuery = `
      SELECT 
        u.id,
        u.email,
        u.password_hash,
        u.name,
        u.lms_role_id,
        r.name as role_name,
        u.preferred_language,
        u.is_active
      FROM users u
      LEFT JOIN lms_roles r ON u.lms_role_id = r.id
      WHERE LOWER(u.email) = LOWER($1)
    `;
    
    const result = await client.query(userQuery, [email]);
    if (result.rows.length === 0) return null;
    
    const dbUser = result.rows[0];
    
    if (!dbUser.is_active) {
      throw new Error('Account is inactive');
    }
    
    const isValidPassword = await bcrypt.compare(password, dbUser.password_hash);
    if (!isValidPassword) return null;
    
    // Assign default role if not set
    if (!dbUser.lms_role_id) {
      const defaultRole = await client.query(
        "SELECT id FROM lms_roles WHERE name = 'student'",
        []
      );
      if (defaultRole.rows.length > 0) {
        await client.query(
          'UPDATE users SET lms_role_id = $1 WHERE id = $2',
          [defaultRole.rows[0].id, dbUser.id]
        );
        dbUser.lms_role_id = defaultRole.rows[0].id;
        dbUser.role_name = 'student';
      }
    }
    
    // Create session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await client.query(
      `INSERT INTO user_sessions 
       (user_id, token, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [dbUser.id, token, expiresAt, ipAddress, userAgent]
    );
    
    // Log login activity
    await logActivity(dbUser.id, 'auth', 'login', { ip: ipAddress });
    
    const user = await getLMSUser(dbUser.id);
    if (!user) throw new Error('Failed to get user data');
    
    return { user, token };
  } finally {
    client.release();
  }
}

// Role-based redirect after login
export function getRoleBasedRedirect(roleName: string): string {
  const roleRedirects: Record<string, string> = {
    'super_admin': '/admin',
    'admin': '/admin',
    'teacher': '/dashboard',
    'student': '/student',
    'parent': '/parent',
    'guardian': '/parent',
    'director': '/admin/reports',
    'partner': '/partner',
    'mentor': '/mentor',
    'collector': '/reports',
    'observer': '/observer',
    'qa': '/qa'
  };
  
  return roleRedirects[roleName] || '/dashboard';
}