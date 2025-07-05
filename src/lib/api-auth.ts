import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getLMSSession } from './lms-auth';

export async function getAPISession(request?: NextRequest) {
  // Try to get session from cookies first
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session')?.value || cookieStore.get('virtual_lab_session')?.value;
  
  if (sessionToken) {
    // Check if this is our auth system session first
    const { getSession } = await import('./auth');
    const authSession = await getSession(sessionToken);
    
    if (authSession) {
      // Convert auth session to API session format
      return {
        id: authSession.id,
        user_id: authSession.user.id,
        user_uuid: authSession.user.id,
        token: sessionToken,
        expires_at: authSession.expiresAt,
        created_at: new Date(),
        last_activity: new Date(),
        user: {
          id: authSession.user.id,
          email: authSession.user.email,
          name: authSession.user.name,
          lms_role_id: authSession.user.role,
          role_name: authSession.user.role,
          preferred_language: 'km',
          avatar_url: null,
          phone_number: authSession.user.phoneNumber,
          schools: [],
          permissions: authSession.user.permissions
        }
      };
    }
    
    // Fallback to LMS session if exists
    return await getLMSSession(sessionToken);
  }
  
  // If no cookie, check for authorization header (for API testing)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return await getLMSSession(token);
    }
  }
  
  return null;
}

export function createMockStudentSession() {
  // Create a mock session for development/testing
  return {
    id: 'mock-session-id',
    user_id: 1, // Using integer ID for student_simulation_progress table
    user_uuid: '41f7b48c-6a3b-4ff9-a67f-3a35841886a3', // Demo Student UUID
    token: 'mock-token',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    created_at: new Date(),
    last_activity: new Date(),
    user: {
      id: '41f7b48c-6a3b-4ff9-a67f-3a35841886a3',
      email: 'student@virtuallab.com',
      name: 'Demo Student',
      lms_role_id: 'student-role-id',
      role_name: 'student',
      preferred_language: 'en',
      avatar_url: null,
      phone_number: null,
      schools: [],
      permissions: []
    }
  };
}