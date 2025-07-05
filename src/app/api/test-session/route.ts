import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('session')?.value;
    
    // Check user_sessions structure and data
    const sessionsResult = await client.query(`
      SELECT 
        s.*,
        pg_typeof(s.user_id) as user_id_type,
        pg_typeof(s.user_uuid) as user_uuid_type
      FROM user_sessions s
      WHERE s.session_token = $1
      LIMIT 1
    `, [sessionToken || 'no-token']);
    
    // Get all active sessions count
    const activeSessionsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active
      FROM user_sessions
    `);
    
    // Test if we can join with users
    let joinTest = null;
    if (sessionToken) {
      try {
        const joinResult = await client.query(`
          SELECT 
            s.session_token,
            s.user_uuid,
            s.user_id,
            u.id as user_id_from_users,
            u.email,
            pg_typeof(u.id) as user_id_type
          FROM user_sessions s
          LEFT JOIN users u ON u.id = s.user_uuid
          WHERE s.session_token = $1
        `, [sessionToken]);
        joinTest = joinResult.rows[0];
      } catch (e: any) {
        joinTest = { error: e.message };
      }
    }
    
    return NextResponse.json({
      success: true,
      sessionToken: sessionToken || 'no-session-cookie',
      currentSession: sessionsResult.rows[0] || null,
      activeSessions: activeSessionsResult.rows[0],
      joinTest,
      message: 'Session debug info'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    }, { status: 500 });
  } finally {
    client.release();
  }
}