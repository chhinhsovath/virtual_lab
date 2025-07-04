import { NextRequest, NextResponse } from 'next/server';
import { getSession, hasPermission } from '../../../../lib/auth';
import { pool } from '../../../../lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user session
    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Check if user has admin permissions
    if (!hasPermission(user, 'admin', 'read') && !user.roles.includes('super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get comprehensive dashboard data
    const client = await pool.connect();
    
    try {
      // First, let's test basic table access
      console.log('Testing database tables...');
      
      // Test each table individually to see which ones exist
      let stats = {
        total_students: '0',
        total_teachers: '0', 
        total_schools: '0',
        total_provinces: '0',
        total_assessments: '0',
        selected_students: '0'
      };

      try {
        const studentResult = await client.query('SELECT COUNT(*) FROM tbl_tarl_student');
        stats.total_students = studentResult.rows[0].count;
        console.log('✓ tbl_tarl_student table found');
      } catch (e: any) {
        console.log('✗ tbl_tarl_student table not found:', e.message);
        // Fallback to try tbl_child
        try {
          const fallbackResult = await client.query('SELECT COUNT(*) FROM tbl_child');
          stats.total_students = fallbackResult.rows[0].count;
          console.log('✓ tbl_child table found as fallback');
        } catch (fallbackError: any) {
          console.log('✗ Both tbl_tarl_student and tbl_child not found');
        }
      }

      try {
        const teacherResult = await client.query('SELECT COUNT(*) FROM tbl_tarl_teacher');
        stats.total_teachers = teacherResult.rows[0].count;
        console.log('✓ tbl_tarl_teacher table found');
      } catch (e: any) {
        console.log('✗ tbl_tarl_teacher table not found:', e.message);
        // Fallback to try tbl_teacher_information
        try {
          const fallbackResult = await client.query('SELECT COUNT(*) FROM tbl_teacher_information');
          stats.total_teachers = fallbackResult.rows[0].count;
          console.log('✓ tbl_teacher_information table found as fallback');
        } catch (fallbackError: any) {
          console.log('✗ Both tbl_tarl_teacher and tbl_teacher_information not found');
        }
      }

      try {
        const schoolResult = await client.query('SELECT COUNT(*) FROM tbl_tarl_school');
        stats.total_schools = schoolResult.rows[0].count;
        console.log('✓ tbl_tarl_school table found');
      } catch (e: any) {
        console.log('✗ tbl_tarl_school table not found:', e.message);
        // Fallback to try tbl_school_list
        try {
          const fallbackResult = await client.query('SELECT COUNT(*) FROM tbl_school_list');
          stats.total_schools = fallbackResult.rows[0].count;
          console.log('✓ tbl_school_list table found as fallback');
        } catch (fallbackError: any) {
          console.log('✗ Both tbl_tarl_school and tbl_school_list not found');
        }
      }

      try {
        const provinceResult = await client.query('SELECT COUNT(*) FROM tbl_province');
        stats.total_provinces = provinceResult.rows[0].count;
        console.log('✓ tbl_province table found');
      } catch (e: any) {
        console.log('✗ tbl_province table not found:', e.message);
      }

      try {
        const assessmentResult = await client.query('SELECT COUNT(*) FROM tarl_assessments');
        stats.total_assessments = assessmentResult.rows[0].count;
        console.log('✓ tarl_assessments table found');
      } catch (e: any) {
        console.log('✗ tarl_assessments table not found:', e.message);
      }

      try {
        const selectionResult = await client.query('SELECT COUNT(*) FROM tarl_student_selection WHERE selected_for_program = true');
        stats.selected_students = selectionResult.rows[0].count;
        console.log('✓ tarl_student_selection table found');
      } catch (e: any) {
        console.log('✗ tarl_student_selection table not found:', e.message);
      }

      // For now, return minimal data to test basic functionality
      return NextResponse.json({
        success: true,
        data: {
          stats,
          assessmentCycles: [],
          levelDistribution: [],
          provinces: [],
          schools: [],
          subjectPerformance: [],
          recentActivity: [],
          teacherPerformance: [],
          gradeDistribution: []
        }
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}