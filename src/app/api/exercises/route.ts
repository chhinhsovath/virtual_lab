import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

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
    const all = searchParams.get('all'); // For teachers to see all exercises

    if (!simulation_id) {
      return NextResponse.json({ error: 'Simulation ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          id,
          question_number,
          question_type,
          question_en,
          question_km,
          instructions_en,
          instructions_km,
          options,
          correct_answer,
          acceptable_answers,
          points,
          difficulty_level,
          hints_en,
          hints_km,
          explanation_en,
          explanation_km,
          is_required,
          is_active
        FROM simulation_exercises
        WHERE simulation_id = $1
      `;
      
      // For students, only show active and required exercises
      if (!all || session.user.role_name !== 'teacher') {
        query += ` AND is_active = true AND is_required = true`;
      }
      
      query += ` ORDER BY question_number`;

      const result = await client.query(query, [simulation_id]);

      return NextResponse.json({
        success: true,
        exercises: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      simulation_id,
      question_number,
      question_type,
      question_en,
      question_km,
      instructions_en,
      instructions_km,
      options,
      correct_answer,
      acceptable_answers,
      points,
      difficulty_level,
      hints_en,
      hints_km,
      explanation_en,
      explanation_km,
      is_required = true
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if question number already exists
      const existingCheck = await client.query(`
        SELECT id FROM simulation_exercises 
        WHERE simulation_id = $1 AND question_number = $2
      `, [simulation_id, question_number]);

      if (existingCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Question number already exists' }, { status: 400 });
      }

      // Insert new exercise
      const result = await client.query(`
        INSERT INTO simulation_exercises (
          simulation_id, teacher_id, question_number, question_type,
          question_en, question_km, instructions_en, instructions_km,
          options, correct_answer, acceptable_answers, points,
          difficulty_level, hints_en, hints_km, explanation_en, explanation_km,
          is_required
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        simulation_id, session.user_id, question_number, question_type,
        question_en, question_km, instructions_en, instructions_km,
        JSON.stringify(options), correct_answer, JSON.stringify(acceptable_answers), points,
        difficulty_level, hints_en, hints_km, explanation_en, explanation_km,
        is_required
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        exercise: result.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulation_id = searchParams.get('simulation_id');

    if (!simulation_id) {
      return NextResponse.json({ error: 'Simulation ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      // Delete all exercises for the simulation
      const result = await client.query(`
        DELETE FROM simulation_exercises
        WHERE simulation_id = $1
        RETURNING id
      `, [simulation_id]);

      return NextResponse.json({
        success: true,
        deleted_count: result.rows.length
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting exercises:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercises', details: error.message },
      { status: 500 }
    );
  }
}