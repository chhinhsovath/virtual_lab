import { type Session, type User, getSession, canAccessSchool } from '../../../../lib/auth';
import { pool } from '../../../../lib/db';

export async function POST(request: Request) {
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

    const data = await request.json();
    const { schoolId, studentIds, subject } = data;

    if (!canAccessSchool(session.user, schoolId)) {
      return new Response('Forbidden', { status: 403 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update or insert student selections
      for (const studentId of studentIds) {
        await client.query(`
          INSERT INTO tarl_student_selection (student_id, school_id, subject, selected_for_program)
          VALUES ($1, $2, $3, true)
          ON CONFLICT (student_id, school_id, subject)
          DO UPDATE SET selected_for_program = true, updated_at = NOW()
        `, [studentId, schoolId, subject]);
      }

      await client.query('COMMIT');

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error selecting students:', error.message);
      return new Response('Internal Server Error', { status: 500 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error in POST select students:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}