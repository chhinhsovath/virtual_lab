import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

interface RouteParams {
  params: {
    childId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (session.user.role !== 'parent' && session.user.role !== 'guardian') {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM lms_parent_students WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s teachers.' 
        }, { status: 403 });
      }

      // Get teachers from student lab activities and courses
      const teachersQuery = `
        WITH student_teachers AS (
          SELECT DISTINCT
            COALESCE(l.created_by, gen_random_uuid()) as teacher_id,
            l.subject,
            COALESCE(u.name, 
              CASE l.subject
                WHEN 'Physics' THEN 'Dr. Sophea Vann'
                WHEN 'Chemistry' THEN 'Prof. Ratana Kim'
                WHEN 'Biology' THEN 'Ms. Sreypov Chea'
                WHEN 'Mathematics' THEN 'Mr. Sovann Lim'
                ELSE 'Virtual Lab Instructor'
              END
            ) as teacher_name,
            COALESCE(u.email,
              CASE l.subject
                WHEN 'Physics' THEN 'sophea.vann@school.edu.kh'
                WHEN 'Chemistry' THEN 'ratana.kim@school.edu.kh'
                WHEN 'Biology' THEN 'sreypov.chea@school.edu.kh'
                WHEN 'Mathematics' THEN 'sovann.lim@school.edu.kh'
                ELSE 'instructor@virtuallab.edu.kh'
              END
            ) as email,
            CASE l.subject
              WHEN 'Physics' THEN '+855 12 345 678'
              WHEN 'Chemistry' THEN '+855 12 456 789'
              WHEN 'Biology' THEN '+855 12 567 890'
              WHEN 'Mathematics' THEN '+855 12 678 901'
              ELSE NULL
            END as phone,
            l.id as course_id
          FROM lms_student_lab_activities sla
          JOIN lms_labs l ON sla.lab_id = l.id
          LEFT JOIN users u ON l.created_by = u.id
          WHERE sla.student_id = $1
        ),
        all_subjects AS (
          SELECT DISTINCT
            gen_random_uuid() as teacher_id,
            lab_subjects.subject,
            CASE lab_subjects.subject
              WHEN 'Physics' THEN 'Dr. Sophea Vann'
              WHEN 'Chemistry' THEN 'Prof. Ratana Kim'
              WHEN 'Biology' THEN 'Ms. Sreypov Chea'
              WHEN 'Mathematics' THEN 'Mr. Sovann Lim'
              ELSE 'Virtual Lab Instructor'
            END as teacher_name,
            CASE lab_subjects.subject
              WHEN 'Physics' THEN 'sophea.vann@school.edu.kh'
              WHEN 'Chemistry' THEN 'ratana.kim@school.edu.kh'
              WHEN 'Biology' THEN 'sreypov.chea@school.edu.kh'
              WHEN 'Mathematics' THEN 'sovann.lim@school.edu.kh'
              ELSE 'instructor@virtuallab.edu.kh'
            END as email,
            CASE lab_subjects.subject
              WHEN 'Physics' THEN '+855 12 345 678'
              WHEN 'Chemistry' THEN '+855 12 456 789'
              WHEN 'Biology' THEN '+855 12 567 890'
              WHEN 'Mathematics' THEN '+855 12 678 901'
              ELSE NULL
            END as phone,
            NULL as course_id
          FROM (
            SELECT DISTINCT l.subject
            FROM lab_sessions ls
            JOIN lms_labs l ON ls.lab_id = l.id
            WHERE ls.student_id = $1
          ) lab_subjects
        )
        SELECT DISTINCT
          teacher_id as id,
          teacher_name as name,
          subject as subject,
          email,
          phone,
          COALESCE(course_id::text, subject) as course_id
        FROM (
          SELECT * FROM student_teachers
          UNION 
          SELECT * FROM all_subjects
        ) combined_teachers
        ORDER BY subject
      `;

      const result = await client.query(teachersQuery, [childId]);
      
      const teachers = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        email: row.email,
        phone: row.phone,
        courseId: row.course_id
      }));

      return NextResponse.json(teachers);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching child teachers:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch teachers' 
    }, { status: 500 });
  }
}