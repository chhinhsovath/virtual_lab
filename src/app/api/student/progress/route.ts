import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulation_id = searchParams.get('simulation_id');
    const subject = searchParams.get('subject');
    const limit = parseInt(searchParams.get('limit') || '10');

    const client = await pool.connect();
    
    try {
      // Log session info for debugging
      console.log('Fetching progress for student:', {
        user_id: session.user_id,
        user_uuid: session.user_uuid,
        role: session.user.role_name
      });

      // Query using the new standardized columns
      let query = `
        SELECT 
          ssp.*,
          s.simulation_name,
          s.display_name_en,
          s.display_name_km,
          s.subject_area,
          s.difficulty_level,
          s.estimated_duration,
          s.preview_image,
          CASE 
            WHEN ssp.completed = true THEN 'completed'
            WHEN ssp.progress_percentage > 0 THEN 'in_progress'
            ELSE 'not_started'
          END as status,
          ssp.progress_percentage,
          ssp.time_spent as total_time_spent,
          ssp.attempts as attempts_count,
          ssp.last_accessed as updated_at
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog s ON ssp.simulation_id = s.id
        WHERE ssp.student_uuid = $1 AND s.is_active = true
      `;

      const queryParams: any[] = [session.user_uuid || session.user_id];
      let paramIndex = 2;

      if (simulation_id) {
        query += ` AND ssp.simulation_id = $${paramIndex}`;
        queryParams.push(simulation_id);
        paramIndex++;
      }

      if (subject) {
        query += ` AND s.subject_area = $${paramIndex}`;
        queryParams.push(subject);
        paramIndex++;
      }

      query += ` ORDER BY ssp.updated_at DESC LIMIT $${paramIndex}`;
      queryParams.push(limit);

      const result = await client.query(query, queryParams);

      // If no progress records exist, return empty array instead of error
      return NextResponse.json({
        success: true,
        progress: result.rows || []
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching student progress:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
    // If it's a data type error, it might be student_id type mismatch
    if (error.code === '22P02' || error.message?.includes('invalid input syntax')) {
      // Return empty progress array instead of error
      return NextResponse.json({
        success: true,
        progress: [],
        message: 'No progress records found'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch student progress', details: error.message },
      { status: 500 }
    );
  }
}

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
    const { simulation_id, assignment_id, initial_progress } = body;

    const client = await pool.connect();
    
    try {
      // Check if simulation exists
      const simulationResult = await client.query(`
        SELECT id FROM stem_simulations_catalog 
        WHERE id = $1 AND is_active = true
      `, [simulation_id]);

      if (simulationResult.rows.length === 0) {
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      // Create new progress record
      const result = await client.query(`
        INSERT INTO student_simulation_progress (
          student_uuid, simulation_id, progress_percentage, time_spent, attempts, created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (student_uuid, simulation_id) 
        DO UPDATE SET 
          attempts = student_simulation_progress.attempts + 1,
          last_accessed = CURRENT_TIMESTAMP
        RETURNING *
      `, [session.user_uuid || session.user_id, simulation_id, 0, 0, 1]);

      return NextResponse.json({
        success: true,
        progress: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating student progress:', error);
    return NextResponse.json(
      { error: 'Failed to create student progress' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { 
      progress_id, 
      current_progress, 
      time_spent, 
      current_score, 
      simulation_data,
      is_completed = false 
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current progress data
      const currentResult = await client.query(`
        SELECT * FROM student_simulation_progress 
        WHERE id = $1 AND student_uuid = $2
      `, [progress_id, session.user_uuid || session.user_id]);

      if (currentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Progress record not found' }, { status: 404 });
      }

      const current = currentResult.rows[0];
      const newTotalTime = (current.time_spent || 0) + (time_spent || 0);
      const newBestScore = Math.max(current.best_score || 0, current_score || 0);

      // Update progress
      const updateResult = await client.query(`
        UPDATE student_simulation_progress 
        SET 
          progress_percentage = LEAST(100, COALESCE($1, progress_percentage)),
          time_spent = $2,
          best_score = $3,
          completed = $4,
          attempts = attempts + 1,
          last_accessed = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [
        current_progress?.percentage || 0,
        newTotalTime,
        newBestScore,
        is_completed || false,
        progress_id
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        progress: updateResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { error: 'Failed to update student progress' },
      { status: 500 }
    );
  }
}