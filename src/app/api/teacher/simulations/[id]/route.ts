import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM stem_simulations_catalog WHERE id = $1',
        [params.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Simulation not found' },
          { status: 404 }
        );
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'teacher') {
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
      preview_image,
      tags,
      is_featured,
      is_active
    } = body;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE stem_simulations_catalog 
         SET simulation_name = $1,
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
             preview_image = $13,
             tags = $14,
             is_featured = $15,
             is_active = $16,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $17
         RETURNING *`,
        [
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
          preview_image,
          tags,
          is_featured,
          is_active,
          params.id
        ]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Simulation not found' },
          { status: 404 }
        );
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      // Check if simulation has related data
      const checkResult = await client.query(
        `SELECT 
          (SELECT COUNT(*) FROM simulation_exercises WHERE simulation_id = $1) as exercise_count,
          (SELECT COUNT(*) FROM student_simulation_progress WHERE simulation_id = $1) as progress_count,
          (SELECT COUNT(*) FROM student_assignments WHERE simulation_id = $1) as assignment_count`,
        [params.id]
      );

      const counts = checkResult.rows[0];
      const hasRelatedData = 
        parseInt(counts.exercise_count) > 0 || 
        parseInt(counts.progress_count) > 0 || 
        parseInt(counts.assignment_count) > 0;

      if (hasRelatedData) {
        // Soft delete by setting is_active to false
        const result = await client.query(
          'UPDATE stem_simulations_catalog SET is_active = false WHERE id = $1 RETURNING *',
          [params.id]
        );

        return NextResponse.json({
          success: true,
          message: 'Simulation deactivated due to existing data',
          simulation: result.rows[0]
        });
      } else {
        // Hard delete if no related data
        await client.query(
          'DELETE FROM stem_simulations_catalog WHERE id = $1',
          [params.id]
        );

        return NextResponse.json({
          success: true,
          message: 'Simulation deleted successfully'
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return NextResponse.json(
      { error: 'Failed to delete simulation' },
      { status: 500 }
    );
  }
}