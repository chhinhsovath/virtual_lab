import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getLMSSession } from './lms-auth';

export async function getAPISession(request?: NextRequest) {
  // Try to get session from cookies first
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('virtual_lab_session')?.value;
  
  if (sessionToken) {
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