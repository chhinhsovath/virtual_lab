import { NextRequest, NextResponse } from 'next/server';
import { type Session, type User, getSession, canAccessSchool } from '../../../../lib/auth';
import { pool } from '../../../../lib/db';

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
          "chiID",
          "chiFirstName" || ' ' || "chiLastName" as "chiName",
          "chiGender",
          "chiGrade" as "chiClass"
        FROM tbl_child 
        WHERE "chiSchoolId" = $1
        ORDER BY "chiFirstName", "chiLastName"
      `, [schoolId]);

      return new Response(JSON.stringify({
        students: result.rows
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      console.error('Error fetching students:', error.message);
      return new Response('Internal Server Error', { status: 500 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error in GET students:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}