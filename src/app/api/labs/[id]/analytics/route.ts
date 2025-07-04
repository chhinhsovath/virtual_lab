import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '@/lib/lms-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;

    // Check permissions - teachers and admins can view analytics
    const canViewAnalytics = await hasLMSPermission(session.user.id, 'assessments', 'read');
    if (!canViewAnalytics) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Check for cached analytics first
      const cacheResult = await client.query(
        'SELECT cache_data FROM lab_analytics_cache WHERE lab_id = $1 AND cache_type = $2 AND expires_at > CURRENT_TIMESTAMP',
        [labId, 'teacher_summary']
      );

      let analytics;
      if (cacheResult.rows.length > 0) {
        analytics = cacheResult.rows[0].cache_data;
      } else {
        // Get fresh analytics from view
        const analyticsResult = await client.query(
          'SELECT * FROM lab_teacher_analytics WHERE lab_id = $1',
          [labId]
        );

        if (analyticsResult.rows.length === 0) {
          // No data yet, return empty analytics
          analytics = {
            lab_id: labId,
            total_students_attempted: 0,
            total_submissions: 0,
            completed_submissions: 0,
            submission_rate_percentage: 0,
            avg_time_minutes: null,
            avg_score: null,
            grade_a_count: 0,
            grade_b_count: 0,
            grade_c_count: 0,
            grade_d_count: 0,
            grade_f_count: 0
          };
        } else {
          analytics = analyticsResult.rows[0];
          
          // Cache the result for 1 hour
          await client.query(
            `INSERT INTO lab_analytics_cache (lab_id, cache_type, cache_data, expires_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '1 hour')
             ON CONFLICT (lab_id, cache_type)
             DO UPDATE SET cache_data = $3, expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'`,
            [labId, 'teacher_summary', JSON.stringify(analytics)]
          );
        }
      }

      // Get detailed student list with performance
      const studentsResult = await client.query(
        `SELECT 
           u.id as student_id,
           u.name as student_name,
           u.email as student_email,
           ls.final_score,
           ls.auto_score,
           ls.manual_score,
           ls.graded_at,
           lsess.duration_minutes,
           lsub.submitted_at,
           CASE 
             WHEN (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1) > 0 
             THEN (ls.final_score / (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1)) * 100
             ELSE NULL 
           END as percentage_score,
           CASE 
             WHEN ls.final_score IS NULL THEN 'Not Graded'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1), 0)) * 100 >= 90 THEN 'A'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1), 0)) * 100 >= 80 THEN 'B'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1), 0)) * 100 >= 70 THEN 'C'
             WHEN (ls.final_score / NULLIF((SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = $1), 0)) * 100 >= 60 THEN 'D'
             ELSE 'F'
           END as letter_grade,
           lsess.status as session_status
         FROM lms_course_enrollments ce
         JOIN users u ON ce.student_id = u.id
         LEFT JOIN lab_sessions lsess ON u.id = lsess.student_id AND lsess.lab_id = $1
         LEFT JOIN lab_submissions lsub ON lsess.id = lsub.session_id
         LEFT JOIN lab_scores ls ON u.id = ls.student_id AND ls.lab_id = $1
         WHERE ce.course_id = $2 AND ce.status = 'enrolled'
         ORDER BY u.name`,
        [labId, lab.course_id]
      );

      // Get rubric criteria for scoring context
      const criteriaResult = await client.query(
        'SELECT * FROM lab_rubric_criteria WHERE lab_id = $1 ORDER BY order_index',
        [labId]
      );

      // Calculate max possible score
      const maxScoreResult = await client.query(
        'SELECT SUM(max_points) as max_possible_score FROM lab_rubric_criteria WHERE lab_id = $1',
        [labId]
      );

      // Get submission timeline data
      const timelineResult = await client.query(
        `SELECT 
           DATE_TRUNC('day', lsub.submitted_at) as submission_date,
           COUNT(*) as submissions_count,
           AVG(ls.final_score) as avg_score_for_day
         FROM lab_submissions lsub
         LEFT JOIN lab_sessions lsess ON lsub.session_id = lsess.id
         LEFT JOIN lab_scores ls ON lsub.student_id = ls.student_id AND ls.lab_id = $1
         WHERE lsess.lab_id = $1 AND lsub.submitted_at IS NOT NULL
         GROUP BY DATE_TRUNC('day', lsub.submitted_at)
         ORDER BY submission_date`,
        [labId]
      );

      await logActivity(
        session.user.id,
        'lab_analytics',
        'view',
        {
          labId,
          labTitle: lab.title,
          totalStudents: analytics.total_students_attempted
        },
        'labs',
        labId
      );

      return NextResponse.json({
        lab,
        analytics,
        students: studentsResult.rows,
        criteria: criteriaResult.rows,
        maxPossibleScore: parseFloat(maxScoreResult.rows[0]?.max_possible_score) || 0,
        submissionTimeline: timelineResult.rows
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST endpoint to refresh analytics cache
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;

    // Check permissions
    const canManage = await hasLMSPermission(session.user.id, 'assessments', 'update');
    if (!canManage) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      // Refresh analytics cache
      await client.query('SELECT refresh_lab_analytics_cache($1)', [labId]);

      await logActivity(
        session.user.id,
        'lab_analytics',
        'refresh_cache',
        { labId },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Analytics cache refreshed successfully'
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error refreshing analytics cache:', error);
    return NextResponse.json(
      { error: 'Failed to refresh cache' },
      { status: 500 }
    );
  }
}