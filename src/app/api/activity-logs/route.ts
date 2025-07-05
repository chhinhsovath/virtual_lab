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
    const limit = parseInt(searchParams.get('limit') || '50');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          id,
          user_id,
          activity_type,
          action,
          details,
          created_at
        FROM lms_activity_logs
        WHERE user_id = $1
        AND activity_type = 'simulation_activity'
      `;
      const queryParams: any[] = [session.user_uuid];

      if (simulation_id) {
        query += ` AND details::jsonb->>'simulation_id' = $${queryParams.length + 1}`;
        queryParams.push(simulation_id);
      }

      if (session_id) {
        query += ` AND details::jsonb->>'session_id' = $${queryParams.length + 1}`;
        queryParams.push(session_id);
      }

      query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1}`;
      queryParams.push(limit);

      const result = await client.query(query, queryParams);

      return NextResponse.json({
        success: true,
        activities: result.rows.map(row => ({
          id: row.id,
          action: row.action,
          details: row.details,
          timestamp: row.created_at
        }))
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