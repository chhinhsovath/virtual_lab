import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Test basic connection
    const client = await pool.connect();
    
    try {
      // Test query
      const result = await client.query('SELECT NOW() as current_time, current_database() as database');
      
      // Check users table
      const usersCheck = await client.query(`
        SELECT COUNT(*) as user_count 
        FROM users 
        WHERE email LIKE '%vlab.edu.kh'
      `);
      
      // Check user_sessions columns
      const columnsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' 
        AND column_name IN ('user_id', 'user_uuid')
      `);
      
      return NextResponse.json({
        success: true,
        database: result.rows[0],
        users: usersCheck.rows[0],
        sessionColumns: columnsCheck.rows.map(r => r.column_name),
        message: 'Database connection successful'
      });
      
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    }, { status: 500 });
  }
}