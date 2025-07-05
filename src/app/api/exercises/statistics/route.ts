import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAPISession(request);
    
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Get statistics for teacher's exercises
      const statsResult = await client.query(`
        SELECT 
          s.id as simulation_id,
          s.display_name_km,
          s.display_name_en,
          COUNT(DISTINCT se.id) as total_exercises,
          COUNT(DISTINCT ses.student_id) as total_students,
          COUNT(DISTINCT ses.id) as total_submissions,
          AVG(ses.points_earned) as avg_score,
          MAX(ses.points_earned) as max_score,
          MIN(ses.points_earned) as min_score,
          SUM(CASE WHEN ses.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
          COUNT(CASE WHEN ses.feedback_from_teacher IS NOT NULL THEN 1 END) as graded_count
        FROM stem_simulations_catalog s
        INNER JOIN simulation_exercises se ON s.id = se.simulation_id
        LEFT JOIN student_exercise_submissions ses ON se.id = ses.exercise_id
        WHERE se.teacher_id = $1
        GROUP BY s.id, s.display_name_km, s.display_name_en
        ORDER BY s.display_name_km
      `, [session.user_id]);

      // Get recent submissions
      const recentResult = await client.query(`
        SELECT 
          ses.id,
          ses.student_id,
          COALESCE(tc.child_name, 'សិស្សគ្មានឈ្មោះ') as student_name,
          se.question_km,
          se.question_number,
          ses.points_earned,
          se.points as max_points,
          ses.submitted_at,
          s.display_name_km as simulation_name
        FROM student_exercise_submissions ses
        JOIN simulation_exercises se ON ses.exercise_id = se.id
        JOIN stem_simulations_catalog s ON se.simulation_id = s.id
        LEFT JOIN tbl_child tc ON ses.student_id = tc.child_id
        WHERE se.teacher_id = $1
        ORDER BY ses.submitted_at DESC
        LIMIT 10
      `, [session.user_id]);

      return NextResponse.json({
        success: true,
        statistics: statsResult.rows,
        recentSubmissions: recentResult.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  }
}