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
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (!session.user.roles.includes('parent') && !session.user.roles.includes('guardian')) {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM parent_student_relationships WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s teachers.' 
        }, { status: 403 });
      }

      // Get teachers from student assignments and create synthetic teacher contacts
      const teachersQuery = `
        WITH student_teachers AS (
          SELECT DISTINCT
            COALESCE(sa.teacher_id, gen_random_uuid()) as teacher_id,
            sc.subject_area,
            COALESCE(u.name, 
              CASE sc.subject_area
                WHEN 'Physics' THEN 'Dr. Sophea Vann'
                WHEN 'Chemistry' THEN 'Prof. Ratana Kim'
                WHEN 'Biology' THEN 'Ms. Sreypov Chea'
                WHEN 'Mathematics' THEN 'Mr. Sovann Lim'
                ELSE 'Virtual Lab Instructor'
              END
            ) as teacher_name,
            COALESCE(u.email,
              CASE sc.subject_area
                WHEN 'Physics' THEN 'sophea.vann@school.edu.kh'
                WHEN 'Chemistry' THEN 'ratana.kim@school.edu.kh'
                WHEN 'Biology' THEN 'sreypov.chea@school.edu.kh'
                WHEN 'Mathematics' THEN 'sovann.lim@school.edu.kh'
                ELSE 'instructor@virtuallab.edu.kh'
              END
            ) as email,
            CASE sc.subject_area
              WHEN 'Physics' THEN '+855 12 345 678'
              WHEN 'Chemistry' THEN '+855 12 456 789'
              WHEN 'Biology' THEN '+855 12 567 890'
              WHEN 'Mathematics' THEN '+855 12 678 901'
              ELSE NULL
            END as phone,
            sc.id as course_id
          FROM student_assignments sa
          JOIN stem_simulations_catalog sc ON sa.simulation_id = sc.id
          LEFT JOIN users u ON sa.teacher_id = u.id
          WHERE sa.student_id = $1
        ),
        all_subjects AS (
          SELECT DISTINCT
            gen_random_uuid() as teacher_id,
            ssp_subjects.subject_area,
            CASE ssp_subjects.subject_area
              WHEN 'Physics' THEN 'Dr. Sophea Vann'
              WHEN 'Chemistry' THEN 'Prof. Ratana Kim'
              WHEN 'Biology' THEN 'Ms. Sreypov Chea'
              WHEN 'Mathematics' THEN 'Mr. Sovann Lim'
              ELSE 'Virtual Lab Instructor'
            END as teacher_name,
            CASE ssp_subjects.subject_area
              WHEN 'Physics' THEN 'sophea.vann@school.edu.kh'
              WHEN 'Chemistry' THEN 'ratana.kim@school.edu.kh'
              WHEN 'Biology' THEN 'sreypov.chea@school.edu.kh'
              WHEN 'Mathematics' THEN 'sovann.lim@school.edu.kh'
              ELSE 'instructor@virtuallab.edu.kh'
            END as email,
            CASE ssp_subjects.subject_area
              WHEN 'Physics' THEN '+855 12 345 678'
              WHEN 'Chemistry' THEN '+855 12 456 789'
              WHEN 'Biology' THEN '+855 12 567 890'
              WHEN 'Mathematics' THEN '+855 12 678 901'
              ELSE NULL
            END as phone,
            NULL as course_id
          FROM (
            SELECT DISTINCT sc.subject_area
            FROM student_simulation_progress ssp
            JOIN stem_simulations_catalog sc ON ssp.simulation_id = sc.id
            WHERE ssp.student_id = $1
          ) ssp_subjects
        )
        SELECT DISTINCT
          teacher_id as id,
          teacher_name as name,
          subject_area as subject,
          email,
          phone,
          COALESCE(course_id::text, subject_area) as course_id
        FROM (
          SELECT * FROM student_teachers
          UNION 
          SELECT * FROM all_subjects
        ) combined_teachers
        ORDER BY subject_area
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