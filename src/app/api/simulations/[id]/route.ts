import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // First check if student_simulation_progress table exists and which columns it has
      let studentIdColumn = null;
      try {
        const columnCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'student_simulation_progress' 
          AND column_name IN ('student_id', 'student_uuid')
        `);
        
        const hasStudentUuid = columnCheck.rows.some(row => row.column_name === 'student_uuid');
        const hasStudentId = columnCheck.rows.some(row => row.column_name === 'student_id');
        
        if (typeof session.user_id === 'string' && session.user_id.includes('-')) {
          // UUID format
          if (hasStudentUuid) {
            studentIdColumn = 'student_uuid';
          }
        } else {
          // Integer format
          if (hasStudentId) {
            studentIdColumn = 'student_id';
          }
        }
      } catch (err) {
        console.log('Could not check student columns:', err);
      }

      // Build query based on available columns
      let query;
      if (studentIdColumn) {
        query = `
          SELECT 
            s.*,
            COALESCE(
              (SELECT AVG(ssp.best_score) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.${studentIdColumn} = $1
              ), 0
            ) as user_average_score,
            COALESCE(
              (SELECT COUNT(*) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.${studentIdColumn} = $1
              ), 0
            ) as user_attempts,
            COALESCE(
              (SELECT SUM(ssp.total_time_spent) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.${studentIdColumn} = $1
              ), 0
            ) as user_total_time,
            COALESCE(
              (SELECT MAX(ssp.best_score) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.${studentIdColumn} = $1
              ), 0
            ) as user_best_score,
            (SELECT COUNT(*) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.completed_at IS NOT NULL
            ) as total_completions,
            (SELECT COUNT(*) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id
            ) as total_attempts
          FROM stem_simulations_catalog s
          WHERE s.id = $2
        `;
      } else {
        // No compatible column - return simulation without user stats
        query = `
          SELECT 
            s.*,
            0 as user_average_score,
            0 as user_attempts,
            0 as user_total_time,
            0 as user_best_score,
            0 as total_completions,
            0 as total_attempts
          FROM stem_simulations_catalog s
          WHERE s.id = $1
        `;
      }

      const result = studentIdColumn 
        ? await client.query(query, [session.user_id, params.id])
        : await client.query(query, [params.id]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        simulation: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching simulation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch simulation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getAPISession(request);
    
    if (!session || (session.user.role_name !== 'teacher' && session.user.role_name !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      simulation_name,
      display_name_en,
      display_name_km,
      description_en,
      description_km,
      subject_area,
      difficulty_level,
      grade_levels,
      estimated_duration,
      learning_objectives_en,
      learning_objectives_km,
      simulation_url,
      simulation_file_path,
      preview_image,
      tags,
      is_featured,
      is_active,
      status,
      exercise_content_en,
      exercise_content_km,
      instruction_content_en,
      instruction_content_km
    } = body;

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE stem_simulations_catalog 
        SET 
          simulation_name = $1,
          display_name_en = $2,
          display_name_km = $3,
          description_en = $4,
          description_km = $5,
          subject_area = $6,
          difficulty_level = $7,
          grade_levels = $8,
          estimated_duration = $9,
          learning_objectives_en = $10,
          learning_objectives_km = $11,
          simulation_url = $12,
          simulation_file_path = $13,
          preview_image = $14,
          tags = $15,
          is_featured = $16,
          is_active = $17,
          status = $18,
          exercise_content_en = $19,
          exercise_content_km = $20,
          instruction_content_en = $21,
          instruction_content_km = $22,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $23
        RETURNING *
      `, [
        simulation_name, display_name_en, display_name_km, description_en, description_km,
        subject_area, difficulty_level, grade_levels, estimated_duration,
        learning_objectives_en, learning_objectives_km, 
        simulation_url, simulation_file_path || simulation_url, preview_image, tags,
        is_featured, is_active, status || 'draft',
        exercise_content_en, exercise_content_km,
        instruction_content_en, instruction_content_km,
        params.id
      ]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        simulation: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getAPISession(request);
    
    if (!session || (session.user.role_name !== 'teacher' && session.user.role_name !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE stem_simulations_catalog 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [params.id]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Simulation deactivated successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deactivating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate simulation' },
      { status: 500 }
    );
  }
}