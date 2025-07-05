import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (session.user.role !== 'parent' && session.user.role !== 'guardian') {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Get children linked to this parent from lms_parent_students table
      const childrenQuery = `
        SELECT 
          u.id,
          u.name as full_name,
          SPLIT_PART(u.name, ' ', 1) as first_name,
          SPLIT_PART(u.name, ' ', -1) as last_name,
          COALESCE(u.username, u.email) as username,
          u.profile_image as profile_picture_url,
          COALESCE(u.is_active::text, 'active') as academic_status,
          u.created_at as enrollment_date,
          lps.relationship_type,
          lps.is_primary_contact,
          -- Calculate grade level from grade_level column or use default
          COALESCE(u.grade_level::text, '5') as grade,
          -- Calculate overall GPA from lab scores
          COALESCE(
            (SELECT AVG(final_score) 
             FROM lab_scores 
             WHERE student_id = u.id AND final_score IS NOT NULL), 
            3.5
          ) as overall_gpa,
          -- Calculate attendance rate (mock for now)
          85 + (RANDOM() * 15)::INTEGER as attendance_rate,
          -- Count enrolled courses/simulations from lab sessions
          (SELECT COUNT(DISTINCT lab_id) 
           FROM lab_sessions 
           WHERE student_id = u.id) as enrolled_courses,
          -- Count pending assignments from lab sessions
          (SELECT COUNT(*) 
           FROM lab_sessions 
           WHERE student_id = u.id AND status IN ('in_progress', 'pending')) as pending_assignments
        FROM lms_parent_students lps
        JOIN users u ON lps.student_id = u.id
        WHERE lps.parent_id = $1
          AND u.is_active = true
        ORDER BY lps.is_primary_contact DESC, u.name
      `;

      const result = await client.query(childrenQuery, [session.user.id]);
      
      const children = result.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        username: row.username,
        grade: row.grade,
        profilePictureUrl: row.profile_picture_url,
        academicStatus: row.academic_status,
        overallGPA: Math.round(row.overall_gpa * 100) / 100, // Round to 2 decimal places
        attendanceRate: row.attendance_rate,
        enrolledCourses: row.enrolled_courses,
        pendingAssignments: row.pending_assignments,
        relationshipType: row.relationship_type,
        isPrimaryContact: row.is_primary_contact
      }));

      return NextResponse.json({
        success: true,
        children
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch children' 
    }, { status: 500 });
  }
}