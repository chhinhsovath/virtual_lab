import { NextRequest, NextResponse } from 'next/server';
import { getSession, type User, type Session } from './auth';

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ user: User; session: Session } | null> {
  const sessionToken = request.cookies.get('session')?.value;
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await getSession(sessionToken);
  
  if (!session) {
    return null;
  }
  
  return { user: session.user, session };
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<{ user: User; session: Session } | NextResponse> {
  const auth = await getAuthenticatedUser(request);
  
  if (!auth) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return auth;
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(
  request: NextRequest, 
  resource: string, 
  action: string
): Promise<{ user: User; session: Session } | NextResponse> {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const hasPermission = auth.user.permissions.some(p => 
    p === `${resource}.${action}`
  );
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return auth;
}

/**
 * Middleware to require specific role
 */
export async function requireRole(
  request: NextRequest, 
  roleName: string
): Promise<{ user: User; session: Session } | NextResponse> {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const userRoles = Array.isArray((auth.user as any).roles) ? (auth.user as any).roles : [auth.user.role];
  if (!userRoles.includes(roleName)) {
    return NextResponse.json(
      { error: 'Insufficient role access' },
      { status: 403 }
    );
  }
  
  return auth;
}

/**
 * Middleware to require school access
 */
export async function requireSchoolAccess(
  request: NextRequest, 
  schoolId: number, 
  requiredAccess: 'read' | 'write' | 'admin' = 'read'
): Promise<{ user: User; session: Session } | NextResponse> {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const accessLevels = { read: 1, write: 2, admin: 3 };
  const requiredLevel = accessLevels[requiredAccess];
  
  const hasAccess = auth.user.schoolAccess.some(access => 
    access.schoolId === schoolId && 
    accessLevels[access.accessType] >= requiredLevel
  );
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Insufficient school access' },
      { status: 403 }
    );
  }
  
  return auth;
}

/**
 * Get accessible school IDs for user with required access level
 */
export function getAccessibleSchoolIds(user: User, requiredAccess: 'read' | 'write' | 'admin' = 'read'): number[] {
  const accessLevels = { read: 1, write: 2, admin: 3 };
  const requiredLevel = accessLevels[requiredAccess];

  return user.schoolAccess
    .filter(access => accessLevels[access.accessType] >= requiredLevel)
    .map(access => access.schoolId);
}

/**
 * Filter query to only include accessible schools
 */
export function addSchoolAccessFilter(user: User, baseQuery: string, requiredAccess: 'read' | 'write' | 'admin' = 'read'): { query: string; params: number[] } {
  const accessibleSchoolIds = getAccessibleSchoolIds(user, requiredAccess);
  
  if (accessibleSchoolIds.length === 0) {
    // User has no school access, return query that returns no results
    return {
      query: `${baseQuery} AND 1 = 0`,
      params: []
    };
  }
  
  // Add school filter to query
  const placeholders = accessibleSchoolIds.map((_, index) => `$${index + 1}`).join(',');
  const schoolFilter = `AND school_id IN (${placeholders})`;
  
  return {
    query: `${baseQuery} ${schoolFilter}`,
    params: accessibleSchoolIds
  };
}