import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession } from '@/lib/api-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAPISession(request);
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feedback_from_teacher, points_earned, is_correct } = body;

    const client = await pool.connect();
    
    try {
      // Verify the teacher owns the exercise for this submission
      const verifyResult = await client.query(`
        SELECT ses.id
        FROM student_exercise_submissions ses
        JOIN simulation_exercises se ON ses.exercise_id = se.id
        WHERE ses.id = $1 AND se.teacher_id = $2
      `, [params.id, session.user_id]);

      if (verifyResult.rows.length === 0) {
        return NextResponse.json({ error: 'Submission not found or access denied' }, { status: 404 });
      }

      // Update the submission
      const updateResult = await client.query(`
        UPDATE student_exercise_submissions
        SET 
          feedback_from_teacher = $1,
          points_earned = $2,
          is_correct = $3,
          graded_by = $4,
          graded_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [
        feedback_from_teacher,
        points_earned,
        is_correct,
        session.user_id,
        params.id
      ]);

      return NextResponse.json({
        success: true,
        submission: updateResult.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission', details: error.message },
      { status: 500 }
    );
  }
}