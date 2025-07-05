import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { simulation_id, session_id, action, details, timestamp, duration } = body;

    const client = await pool.connect();
    
    try {
      // Log the activity in lms_activity_logs table
      await client.query(`
        INSERT INTO lms_activity_logs (
          user_id, 
          activity_type, 
          action, 
          details,
          resource_type,
          resource_id,
          duration_seconds
        ) VALUES ($1, $2, $3, $4, $5, $6::uuid, $7)
      `, [
        session.user_uuid,
        'simulation_activity',
        action,
        JSON.stringify({
          simulation_id,
          session_id,
          details,
          timestamp
        }),
        'simulation',
        simulation_id,
        duration || 0
      ]);

      // Also update simulation progress
      if (session_id) {
        await client.query(`
          UPDATE student_simulation_progress
          SET updated_at = CURRENT_TIMESTAMP,
              total_time_spent = COALESCE(total_time_spent, 0) + $1::integer,
              current_progress = COALESCE(current_progress, '{}'::jsonb) || 
                jsonb_build_object('last_activity', jsonb_build_object(
                  'action', $2::text,
                  'timestamp', $3::text,
                  'duration', $4::integer
                ))
          WHERE id = $5::uuid
        `, [
          duration || 0,
          action,
          timestamp,
          duration || 0,
          session_id
        ]);
      }

      return NextResponse.json({ success: true });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulation_id = searchParams.get('simulation_id');
    const session_id = searchParams.get('session_id');
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = await pool.connect();
    
    try {
      // Mock activity data for now since we don't have the activity logging table yet
      const mockActivities = [
        {
          id: '1',
          user_id: session.user_uuid || session.user_id,
          action: 'login',
          resource_type: 'system',
          resource_name: 'Student Portal',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          session_id: 'session_123'
        },
        {
          id: '2',
          user_id: session.user_uuid || session.user_id,
          action: 'simulation_start',
          resource_type: 'simulation',
          resource_name: 'Physics Pendulum Lab',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          duration: 1800,
          session_id: 'session_123'
        },
        {
          id: '3',
          user_id: session.user_uuid || session.user_id,
          action: 'exercise_submit',
          resource_type: 'exercise',
          resource_name: 'Pendulum Questions',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          duration: 120,
          session_id: 'session_123'
        },
        {
          id: '4',
          user_id: session.user_uuid || session.user_id,
          action: 'simulation_complete',
          resource_type: 'simulation',
          resource_name: 'Physics Pendulum Lab',
          timestamp: new Date().toISOString(),
          duration: 2400,
          session_id: 'session_123'
        }
      ];

      // Mock session data
      const mockSessions = [
        {
          session_id: 'session_123',
          login_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          logout_time: new Date().toISOString(),
          duration_minutes: 60,
          activities_count: 4,
          simulations_accessed: ['Physics Pendulum Lab'],
          exercises_submitted: 1
        }
      ];

      return NextResponse.json({
        success: true,
        activities: mockActivities,
        sessions: mockSessions
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}