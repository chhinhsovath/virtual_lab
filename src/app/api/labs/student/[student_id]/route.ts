import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '../../../../../lib/lms-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.student_id;
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('course_id');

    // Permission check - parents can view their children, teachers can view their students, students can view themselves
    const isStudent = session.user.id === studentId;
    const isTeacher = await hasLMSPermission(session.user.id, 'assessments', 'read');
    const isParent = session.user.role_name === 'parent';

    if (!isStudent && !isTeacher && !isParent) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      // Verify student exists
      const studentResult = await client.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [studentId]
      );

      if (studentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      const student = studentResult.rows[0];

      // If parent, verify relationship
      if (isParent) {
        const relationshipResult = await client.query(
          'SELECT * FROM parent_student_relationships WHERE parent_id = $1 AND student_id = $2',
          [session.user.id, studentId]
        );

        if (relationshipResult.rows.length === 0) {
          return NextResponse.json({ error: 'Access denied - not your child' }, { status: 403 });
        }
      }

      // Get student's lab performance data
      let labPerformanceQuery = `
        SELECT * FROM lab_parent_view 
        WHERE student_id = $1
      `;
      let queryParams = [studentId];

      if (courseId) {
        labPerformanceQuery += ' AND course_id = $2';
        queryParams.push(courseId);
      }

      labPerformanceQuery += ' ORDER BY submitted_at DESC';

      const labPerformanceResult = await client.query(labPerformanceQuery, queryParams);

      // Get student summary statistics
      let summaryQuery = `
        SELECT * FROM student_lab_summary 
        WHERE student_id = $1
      `;
      let summaryParams = [studentId];

      if (courseId) {
        summaryQuery += ' AND course_id = $2';
        summaryParams.push(courseId);
      }

      const summaryResult = await client.query(summaryQuery, summaryParams);

      // Get recent lab activity (last 30 days)
      const recentActivityResult = await client.query(
        `SELECT 
           l.title as lab_title,
           l.subject,
           lsub.submitted_at,
           ls.final_score,
           ls.graded_at,
           CASE 
             WHEN (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id) > 0 
             THEN (ls.final_score / (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id)) * 100
             ELSE NULL 
           END as percentage_score,
           CASE 
             WHEN ls.final_score IS NULL THEN 'Not Graded'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 90 THEN 'A'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 80 THEN 'B'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 70 THEN 'C'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id), 0)) * 100 >= 60 THEN 'D'
             ELSE 'F'
           END as letter_grade
         FROM lab_submissions lsub
         JOIN lab_sessions lsess ON lsub.session_id = lsess.id
         JOIN lms_labs l ON lsess.lab_id = l.id
         LEFT JOIN lab_scores ls ON l.id = ls.lab_id AND lsub.student_id = ls.student_id
         WHERE lsub.student_id = $1 
           AND lsub.submitted_at >= CURRENT_DATE - INTERVAL '30 days'
           ${courseId ? 'AND l.course_id = $2' : ''}
         ORDER BY lsub.submitted_at DESC
         LIMIT 10`,
        courseId ? [studentId, courseId] : [studentId]
      );

      // Get courses the student is enrolled in
      const coursesResult = await client.query(
        `SELECT c.id, c.name, c.subject, c.grade
         FROM lms_courses c
         JOIN lms_course_enrollments ce ON c.id = ce.course_id
         WHERE ce.student_id = $1 AND ce.status = 'enrolled'
         ORDER BY c.name`,
        [studentId]
      );

      // Get class rankings (if student/parent wants to see comparative performance)
      const rankingResult = await client.query(
        `WITH student_averages AS (
           SELECT 
             student_id,
             AVG(final_score) as avg_score,
             COUNT(*) as labs_completed
           FROM lab_scores ls
           JOIN lms_labs l ON ls.lab_id = l.id
           WHERE l.course_id = COALESCE($2, l.course_id)
           GROUP BY student_id
           HAVING COUNT(*) > 0
         ),
         ranked_students AS (
           SELECT 
             student_id,
             avg_score,
             labs_completed,
             RANK() OVER (ORDER BY avg_score DESC) as rank,
             COUNT(*) OVER () as total_students
           FROM student_averages
         )
         SELECT rank, total_students, avg_score, labs_completed
         FROM ranked_students
         WHERE student_id = $1`,
        [studentId, courseId]
      );

      // Calculate improvement trend (last 5 labs vs previous 5 labs)
      const improvementResult = await client.query(
        `WITH recent_scores AS (
           SELECT 
             ls.final_score,
             ls.graded_at,
             ROW_NUMBER() OVER (ORDER BY ls.graded_at DESC) as rn
           FROM lab_scores ls
           JOIN lms_labs l ON ls.lab_id = l.id
           WHERE ls.student_id = $1 
             AND ls.final_score IS NOT NULL
             ${courseId ? 'AND l.course_id = $2' : ''}
           ORDER BY ls.graded_at DESC
           LIMIT 10
         )
         SELECT 
           AVG(CASE WHEN rn <= 5 THEN final_score END) as recent_avg,
           AVG(CASE WHEN rn > 5 THEN final_score END) as previous_avg,
           COUNT(CASE WHEN rn <= 5 THEN 1 END) as recent_count,
           COUNT(CASE WHEN rn > 5 THEN 1 END) as previous_count
         FROM recent_scores`,
        courseId ? [studentId, courseId] : [studentId]
      );

      await logActivity(
        session.user.id,
        'student_analytics',
        'view',
        {
          viewedStudentId: studentId,
          viewedStudentName: student.name,
          viewerRole: session.user.role_name,
          courseId: courseId || 'all'
        },
        'analytics',
        studentId
      );

      return NextResponse.json({
        student,
        labPerformance: labPerformanceResult.rows,
        summary: summaryResult.rows[0] || null,
        recentActivity: recentActivityResult.rows,
        courses: coursesResult.rows,
        ranking: rankingResult.rows[0] || null,
        improvement: improvementResult.rows[0] || null
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching student lab data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
}