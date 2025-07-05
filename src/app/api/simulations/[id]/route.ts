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
      const result = await client.query(`
        SELECT 
          s.*,
          COALESCE(
            (SELECT AVG(ssp.best_score) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
            ), 0
          ) as user_average_score,
          COALESCE(
            (SELECT COUNT(*) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
            ), 0
          ) as user_attempts,
          COALESCE(
            (SELECT SUM(ssp.total_time_spent) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
            ), 0
          ) as user_total_time,
          COALESCE(
            (SELECT MAX(ssp.best_score) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
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
        WHERE s.id = $2 AND s.is_active = true
      `, [session.user_id, params.id]);

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
    console.error('Error fetching simulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation' },
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
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
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
      preview_image,
      tags,
      is_featured,
      is_active
    } = body;

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE stem_simulations_catalog 
        SET 
          display_name_en = $1,
          display_name_km = $2,
          description_en = $3,
          description_km = $4,
          subject_area = $5,
          difficulty_level = $6,
          grade_levels = $7,
          estimated_duration = $8,
          learning_objectives_en = $9,
          learning_objectives_km = $10,
          simulation_url = $11,
          preview_image = $12,
          tags = $13,
          is_featured = $14,
          is_active = $15,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $16
        RETURNING *
      `, [
        display_name_en, display_name_km, description_en, description_km,
        subject_area, difficulty_level, grade_levels, estimated_duration,
        learning_objectives_en, learning_objectives_km, simulation_url, preview_image, tags,
        is_featured, is_active, params.id
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
    
    if (!session || session.user.role_name !== 'teacher') {
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