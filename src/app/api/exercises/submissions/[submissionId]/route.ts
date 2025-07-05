import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const session = await getSession();
  if (!session || session.user_role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    // Get submission details with exercises
    const submissionQuery = `
      SELECT 
        ses.id,
        ses.student_id,
        ses.simulation_id,
        ses.submitted_at,
        ses.total_score,
        ses.max_score,
        ses.teacher_feedback,
        ses.graded_at,
        c.chiNameEn as student_name,
        c.chiNameKh as student_name_km,
        ssc.display_name_en as simulation_name,
        ssc.display_name_km as simulation_name_km,
        json_agg(
          json_build_object(
            'id', ses.id || '-' || se.id,
            'exercise_id', se.id,
            'question_number', se.question_number,
            'question_text', COALESCE(se.question_km, se.question_en),
            'question_type', se.question_type,
            'student_answer', ses.details->(se.id::text)->>'answer',
            'correct_answer', se.correct_answer,
            'is_correct', (ses.details->(se.id::text)->>'is_correct')::boolean,
            'points_earned', COALESCE((ses.details->(se.id::text)->>'points_earned')::numeric, 0),
            'max_points', se.points,
            'time_spent', COALESCE((ses.details->(se.id::text)->>'time_spent')::integer, 0),
            'feedback', ses.details->(se.id::text)->>'feedback'
          ) ORDER BY se.question_number
        ) as exercises
      FROM student_exercise_submissions ses
      JOIN tbl_child c ON ses.student_id = c.chiID
      JOIN stem_simulations_catalog ssc ON ses.simulation_id = ssc.id
      LEFT JOIN simulation_exercises se ON se.simulation_id = ses.simulation_id
      WHERE ses.id = $1
      GROUP BY ses.id, c.chiNameEn, c.chiNameKh, ssc.display_name_en, ssc.display_name_km
    `;

    const result = await client.query(submissionQuery, [params.submissionId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      submission: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}