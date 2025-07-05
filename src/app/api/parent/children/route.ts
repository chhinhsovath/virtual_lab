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
    if (!session.user.roles.includes('parent') && !session.user.roles.includes('guardian')) {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Get children linked to this parent from parent_student_relationships table
      const childrenQuery = `
        SELECT 
          u.id,
          u.name as full_name,
          SPLIT_PART(u.name, ' ', 1) as first_name,
          SPLIT_PART(u.name, ' ', -1) as last_name,
          u.username,
          u.profile_picture_url,
          u.academic_status,
          u.enrollment_date,
          psr.relationship_type,
          psr.is_primary_contact,
          -- Calculate grade level (mock for now, can be enhanced)
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 6 AND 7 THEN '1'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 7 AND 8 THEN '2'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 8 AND 9 THEN '3'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 9 AND 10 THEN '4'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 10 AND 11 THEN '5'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 11 AND 12 THEN '6'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 12 AND 13 THEN '7'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 13 AND 14 THEN '8'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 14 AND 15 THEN '9'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 15 AND 16 THEN '10'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 16 AND 17 THEN '11'
            WHEN EXTRACT(YEAR FROM AGE(u.date_of_birth)) BETWEEN 17 AND 18 THEN '12'
            ELSE 'K'
          END as grade,
          -- Calculate overall GPA from simulation scores
          COALESCE(
            (SELECT AVG(best_score) 
             FROM student_simulation_progress 
             WHERE student_id = u.id AND completed = true), 
            0
          ) as overall_gpa,
          -- Calculate attendance rate (mock for now)
          85 + (RANDOM() * 15)::INTEGER as attendance_rate,
          -- Count enrolled courses/simulations
          (SELECT COUNT(DISTINCT simulation_id) 
           FROM student_simulation_progress 
           WHERE student_id = u.id) as enrolled_courses,
          -- Count pending assignments
          (SELECT COUNT(*) 
           FROM student_assignments 
           WHERE student_id = u.id AND status IN ('pending', 'in_progress')) as pending_assignments
        FROM parent_student_relationships psr
        JOIN users u ON psr.student_id = u.id
        WHERE psr.parent_id = $1
          AND u.academic_status = 'active'
        ORDER BY psr.is_primary_contact DESC, u.name
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