import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Check if teacher_simulation_assignments table exists and its columns
    const tableResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'teacher_simulation_assignments'
      ORDER BY ordinal_position
    `);
    
    // Check if student_assignment_submissions table exists
    const submissionsTableResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'student_assignment_submissions'
      ORDER BY ordinal_position
    `);
    
    return NextResponse.json({
      success: true,
      teacher_simulation_assignments: {
        exists: tableResult.rows.length > 0,
        columns: tableResult.rows
      },
      student_assignment_submissions: {
        exists: submissionsTableResult.rows.length > 0,
        columns: submissionsTableResult.rows
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 });
  } finally {
    client.release();
  }
}