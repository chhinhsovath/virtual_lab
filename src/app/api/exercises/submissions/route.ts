import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAPISession(request);
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulation_id = searchParams.get('simulation_id');
    const student_id = searchParams.get('student_id');

    if (!simulation_id) {
      return NextResponse.json({ error: 'Simulation ID required' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          ses.id,
          ses.student_id,
          COALESCE(tc.child_name, 'សិស្សគ្មានឈ្មោះ') as student_name,
          ses.exercise_id,
          se.question_number,
          se.question_km,
          se.question_type,
          ses.student_answer,
          ses.is_correct,
          ses.points_earned,
          se.points as max_points,
          ses.time_spent,
          ses.submitted_at,
          ses.feedback_from_teacher,
          ses.graded_by,
          ses.graded_at
        FROM student_exercise_submissions ses
        JOIN simulation_exercises se ON ses.exercise_id = se.id
        LEFT JOIN tbl_child tc ON ses.student_id = tc.child_id
        WHERE se.simulation_id = $1
      `;
      const queryParams: any[] = [simulation_id];

      // Filter by teacher's exercises
      query += ` AND se.teacher_id = $${queryParams.length + 1}`;
      queryParams.push(session.user_id);

      if (student_id) {
        query += ` AND ses.student_id = $${queryParams.length + 1}`;
        queryParams.push(parseInt(student_id));
      }

      query += ` ORDER BY ses.submitted_at DESC, se.question_number`;

      const result = await client.query(query, queryParams);

      return NextResponse.json({
        success: true,
        submissions: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    );
  }
}