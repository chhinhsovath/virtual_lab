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
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const teacher_id = searchParams.get('teacher_id');

    const client = await pool.connect();
    
    try {
      let query, queryParams: any[];

      if (session.user.role_name === 'student') {
        // Student view - get assignments for student
        query = `
          SELECT 
            tsa.*,
            s.simulation_name,
            s.display_name_en,
            s.display_name_km,
            s.subject_area,
            s.difficulty_level,
            s.estimated_duration,
            s.preview_image,
            'pending' as submission_status,
            0 as student_score,
            0 as time_spent
          FROM teacher_simulation_assignments tsa
          JOIN stem_simulations_catalog s ON tsa.simulation_id = s.id
          WHERE tsa.is_active = true
        `;
        queryParams = [];
      } else {
        // Teacher view - get assignments created by teacher
        query = `
          SELECT 
            tsa.*,
            s.simulation_name,
            s.display_name_en,
            s.display_name_km,
            s.subject_area,
            s.difficulty_level,
            s.estimated_duration,
            s.preview_image,
            0 as total_submissions,
            0 as submitted_count,
            0 as average_score
          FROM teacher_simulation_assignments tsa
          JOIN stem_simulations_catalog s ON tsa.simulation_id = s.id
          WHERE tsa.is_active = true
        `;
        queryParams = [];

        if (teacher_id) {
          query += ` AND tsa.teacher_id = $${queryParams.length + 1}`;
          queryParams.push(teacher_id);
        } else if (session.user_id) {
          query += ` AND tsa.teacher_id = $${queryParams.length + 1}`;
          queryParams.push(session.user_id);
        }
      }

      let paramIndex = queryParams.length + 1;

      if (subject) {
        query += ` AND s.subject_area = $${paramIndex}`;
        queryParams.push(subject);
        paramIndex++;
      }

      if (status && session.student_id) {
        query += ` AND EXISTS (
          SELECT 1 FROM student_assignment_submissions sas 
          WHERE sas.assignment_id = tsa.id AND sas.student_id = $1 AND sas.status = $${paramIndex}
        )`;
        queryParams.push(status);
        paramIndex++;
      }

      query += ` ORDER BY tsa.created_at DESC`;

      const result = await client.query(query, queryParams);

      return NextResponse.json({
        success: true,
        assignments: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch assignments', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      simulation_id,
      title,
      description,
      instructions_en,
      instructions_km,
      due_date,
      max_score,
      is_graded,
      school_id,
      grade_levels
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if simulation exists
      const simulationResult = await client.query(`
        SELECT id FROM stem_simulations_catalog 
        WHERE id = $1 AND is_active = true
      `, [simulation_id]);

      if (simulationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      // Create assignment
      const result = await client.query(`
        INSERT INTO teacher_simulation_assignments (
          teacher_id, simulation_id, title, description, instructions_en, instructions_km,
          due_date, max_score, is_graded, school_id, grade_levels
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        session.user_id, simulation_id, title, description, instructions_en, instructions_km,
        due_date, max_score, is_graded, school_id, grade_levels
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        assignment: result.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}