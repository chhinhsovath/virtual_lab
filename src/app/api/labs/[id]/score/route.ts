import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '@/lib/lms-auth';

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
    const body = await request.json();
    const { studentId, submissionId, triggerAutoScore = true } = body;

    // Check permissions - teachers can score, students can view their own scores
    const canGrade = await hasLMSPermission(session.user.id, 'assessments', 'create') ||
                     await hasLMSPermission(session.user.id, 'assessments', 'update');
    
    if (!canGrade && session.user.id !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get submission data
      let submission = null;
      if (submissionId) {
        const submissionResult = await client.query(
          'SELECT * FROM lab_submissions WHERE id = $1 AND student_id = $2',
          [submissionId, studentId]
        );
        if (submissionResult.rows.length > 0) {
          submission = submissionResult.rows[0];
        }
      } else {
        // Get latest submission for student and lab
        const submissionResult = await client.query(
          `SELECT lsub.* FROM lab_submissions lsub
           JOIN lab_sessions lsess ON lsub.session_id = lsess.id
           WHERE lsess.lab_id = $1 AND lsub.student_id = $2
           ORDER BY lsub.submitted_at DESC LIMIT 1`,
          [labId, studentId]
        );
        if (submissionResult.rows.length > 0) {
          submission = submissionResult.rows[0];
        }
      }

      if (!submission) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'No submission found' }, { status: 404 });
      }

      let autoScore = null;
      let rubricBreakdown = null;

      // Calculate auto-score if requested and submission has responses
      if (triggerAutoScore && submission.responses) {
        try {
          // Calculate auto-score using the database function
          const autoScoreResult = await client.query(
            'SELECT calculate_auto_score($1, $2) as score',
            [labId, submission.responses]
          );
          autoScore = parseFloat(autoScoreResult.rows[0].score) || 0;

          // Generate rubric breakdown
          const breakdownResult = await client.query(
            'SELECT generate_rubric_breakdown($1, $2) as breakdown',
            [labId, submission.responses]
          );
          rubricBreakdown = breakdownResult.rows[0].breakdown;

        } catch (error) {
          console.error('Auto-scoring error:', error);
          autoScore = 0;
          rubricBreakdown = {};
        }
      }

      // Create or update score record
      const scoreResult = await client.query(
        `INSERT INTO lab_scores (student_id, lab_id, submission_id, auto_score, rubric_breakdown, graded_by, graded_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, lab_id)
         DO UPDATE SET 
           auto_score = $4,
           rubric_breakdown = $5,
           graded_by = $6,
           graded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [studentId, labId, submission.id, autoScore, rubricBreakdown, session.user.id]
      );

      const score = scoreResult.rows[0];

      // Get rubric criteria for context
      const criteriaResult = await client.query(
        'SELECT * FROM lab_rubric_criteria WHERE lab_id = $1 ORDER BY order_index',
        [labId]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_assessment',
        'score',
        {
          labId,
          studentId,
          submissionId: submission.id,
          autoScore,
          finalScore: score.final_score
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Score calculated successfully',
        score,
        submission,
        criteria: criteriaResult.rows,
        autoScoreTriggered: triggerAutoScore
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error calculating lab score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}

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
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');

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

      if (studentId) {
        // Get specific student's score
        const canViewOthers = await hasLMSPermission(session.user.id, 'assessments', 'read');
        if (!canViewOthers && session.user.id !== studentId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const scoreResult = await client.query(
          `SELECT ls.*, lsa.*, u.name as student_name
           FROM lab_scores ls
           LEFT JOIN lab_assessment_analytics lsa ON ls.id = lsa.score_id
           LEFT JOIN users u ON ls.student_id = u.id
           WHERE ls.lab_id = $1 AND ls.student_id = $2`,
          [labId, studentId]
        );

        // Get annotations
        const annotationsResult = await client.query(
          `SELECT lsanno.*, lrc.criterion_name, lrc.max_points
           FROM lab_score_annotations lsanno
           JOIN lab_rubric_criteria lrc ON lsanno.criterion_id = lrc.id
           JOIN lab_scores ls ON lsanno.score_id = ls.id
           WHERE ls.lab_id = $1 AND ls.student_id = $2
           ORDER BY lrc.order_index`,
          [labId, studentId]
        );

        return NextResponse.json({
          score: scoreResult.rows[0] || null,
          annotations: annotationsResult.rows,
          lab
        });
      } else {
        // Get all scores for the lab (teacher view)
        const canViewAll = await hasLMSPermission(session.user.id, 'assessments', 'read');
        if (!canViewAll) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const scoresResult = await client.query(
          'SELECT * FROM lab_assessment_analytics WHERE lab_id = $1 ORDER BY student_name',
          [labId]
        );

        // Get rubric criteria
        const criteriaResult = await client.query(
          'SELECT * FROM lab_rubric_criteria WHERE lab_id = $1 ORDER BY order_index',
          [labId]
        );

        // Get summary statistics
        const statsResult = await client.query(
          `SELECT 
             COUNT(*) as total_submissions,
             COUNT(final_score) as graded_count,
             AVG(final_score) as average_score,
             MIN(final_score) as min_score,
             MAX(final_score) as max_score,
             STDDEV(final_score) as score_stddev
           FROM lab_scores WHERE lab_id = $1`,
          [labId]
        );

        return NextResponse.json({
          scores: scoresResult.rows,
          criteria: criteriaResult.rows,
          statistics: statsResult.rows[0],
          lab
        });
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}