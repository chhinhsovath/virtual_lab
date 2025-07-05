import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  
  try {
    // Get all columns from users table
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    // Try a simple query
    const testResult = await client.query(`
      SELECT id, email, name, role, password_hash
      FROM users 
      WHERE email = 'student@vlab.edu.kh'
      LIMIT 1
    `);
    
    return NextResponse.json({
      success: true,
      columns: columnsResult.rows,
      testUser: testResult.rows[0] || null,
      message: 'Column check complete'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      position: error.position,
      query: error.query
    }, { status: 500 });
  } finally {
    client.release();
  }
}