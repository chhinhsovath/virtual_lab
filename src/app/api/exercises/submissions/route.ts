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
          COALESCE(tc.chiNameKh, tc.chiNameEn, 'សិស្សគ្មានឈ្មោះ') as student_name,
          ses.simulation_id,
          ssc.display_name_km as simulation_name,
          COUNT(DISTINCT ses.exercise_id) as exercise_count,
          ses.total_score,
          ses.max_score,
          ses.time_spent,
          ses.submitted_at,
          ses.is_graded,
          ses.graded_at,
          ses.teacher_feedback
        FROM student_exercise_submissions ses
        JOIN stem_simulations_catalog ssc ON ses.simulation_id = ssc.id
        LEFT JOIN tbl_child tc ON ses.student_id = tc.chiID
        WHERE ses.simulation_id = $1
      `;
      const queryParams: any[] = [simulation_id];

      if (student_id) {
        query += ` AND ses.student_id = $${queryParams.length + 1}`;
        queryParams.push(parseInt(student_id));
      }

      query += ` GROUP BY ses.id, ses.student_id, tc.chiNameKh, tc.chiNameEn, ses.simulation_id, ssc.display_name_km
                 ORDER BY ses.submitted_at DESC`;

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