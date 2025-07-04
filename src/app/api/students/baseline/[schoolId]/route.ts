import { type Session, type User, getSession, canAccessSchool } from '../../../../../lib/auth';
import { pool } from '../../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const cookies = request.headers.get('cookie');
    const sessionToken = cookies?.split(';').find(c => c.trim().startsWith('session='))?.split('=')[1];

    if (!sessionToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const schoolId = parseInt(params.schoolId);
    if (!canAccessSchool(session.user, schoolId)) {
      return new Response('Forbidden', { status: 403 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          c.gender,
          c.date_of_birth,
          ci.grade,
          ci.class,
          sl.school_name,
          tb.baseline_score,
          tb.baseline_date
        FROM tbl_child c
        LEFT JOIN tbl_child_information ci ON c.id = ci.child_id
        LEFT JOIN tbl_school_list sl ON ci.school_id = sl.id
        LEFT JOIN tbl_baseline tb ON c.id = tb.student_id
        WHERE ci.school_id = $1
        ORDER BY c.first_name, c.last_name
      `, [schoolId]);

      return new Response(JSON.stringify(result.rows), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      console.error('Error fetching baseline data:', error.message);
      return new Response('Internal Server Error', { status: 500 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error in GET baseline:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}