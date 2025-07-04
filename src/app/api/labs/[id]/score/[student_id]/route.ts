import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../../lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '../../../../../../lib/lms-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; student_id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;
    const studentId = params.student_id;

    // Check permissions - only teachers/admins can override scores
    const canGrade = await hasLMSPermission(session.user.id, 'assessments', 'update');
    if (!canGrade) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      manual_score, 
      teacher_comments, 
      rubric_breakdown,
      criterion_scores // Array of { criterion_id, points_awarded, comment }
    } = body;

    if (manual_score === undefined || manual_score === null) {
      return NextResponse.json(
        { error: 'manual_score is required' },
        { status: 400 }
      );
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
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'write');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Verify student exists and is enrolled
      const studentResult = await client.query(
        `SELECT u.id, u.name 
         FROM users u
         JOIN lms_course_enrollments ce ON u.id = ce.student_id
         WHERE u.id = $1 AND ce.course_id = $2 AND ce.status = 'enrolled'`,
        [studentId, lab.course_id]
      );

      if (studentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Student not found or not enrolled' }, { status: 404 });
      }

      const student = studentResult.rows[0];

      // Get or create score record
      const scoreResult = await client.query(
        `INSERT INTO lab_scores (student_id, lab_id, manual_score, teacher_comments, rubric_breakdown, graded_by, graded_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, lab_id)
         DO UPDATE SET 
           manual_score = $3,
           teacher_comments = $4,
           rubric_breakdown = COALESCE($5, lab_scores.rubric_breakdown),
           graded_by = $6,
           graded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [studentId, labId, manual_score, teacher_comments, rubric_breakdown, session.user.id]
      );

      const score = scoreResult.rows[0];

      // Handle criterion-specific scores and comments if provided
      if (criterion_scores && Array.isArray(criterion_scores)) {
        // Delete existing annotations for this score
        await client.query(
          'DELETE FROM lab_score_annotations WHERE score_id = $1',
          [score.id]
        );

        // Insert new annotations
        for (const criterionScore of criterion_scores) {
          if (criterionScore.criterion_id) {
            await client.query(
              `INSERT INTO lab_score_annotations 
               (score_id, criterion_id, points_awarded, teacher_comment, created_by)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                score.id,
                criterionScore.criterion_id,
                criterionScore.points_awarded || 0,
                criterionScore.comment || '',
                session.user.id
              ]
            );
          }
        }
      }

      // Get updated score with annotations
      const updatedScoreResult = await client.query(
        `SELECT ls.*, u.name as student_name, grader.name as graded_by_name
         FROM lab_scores ls
         LEFT JOIN users u ON ls.student_id = u.id
         LEFT JOIN users grader ON ls.graded_by = grader.id
         WHERE ls.id = $1`,
        [score.id]
      );

      const annotationsResult = await client.query(
        `SELECT lsa.*, lrc.criterion_name, lrc.max_points
         FROM lab_score_annotations lsa
         JOIN lab_rubric_criteria lrc ON lsa.criterion_id = lrc.id
         WHERE lsa.score_id = $1
         ORDER BY lrc.order_index`,
        [score.id]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_assessment',
        'manual_override',
        {
          labId,
          studentId,
          studentName: student.name,
          previousScore: score.auto_score,
          newScore: manual_score,
          hasComments: !!teacher_comments
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Score updated successfully',
        score: updatedScoreResult.rows[0],
        annotations: annotationsResult.rows
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating lab score:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; student_id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;
    const studentId = params.student_id;

    // Check permissions
    const canView = await hasLMSPermission(session.user.id, 'assessments', 'read') ||
                    session.user.id === studentId;
    
    if (!canView) {
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

      // Get score with detailed information
      const scoreResult = await client.query(
        `SELECT ls.*, u.name as student_name, grader.name as graded_by_name,
                lsub.responses, lsub.submitted_at, lsess.duration_minutes
         FROM lab_scores ls
         LEFT JOIN users u ON ls.student_id = u.id
         LEFT JOIN users grader ON ls.graded_by = grader.id
         LEFT JOIN lab_submissions lsub ON ls.submission_id = lsub.id
         LEFT JOIN lab_sessions lsess ON lsub.session_id = lsess.id
         WHERE ls.lab_id = $1 AND ls.student_id = $2`,
        [labId, studentId]
      );

      // Get rubric criteria
      const criteriaResult = await client.query(
        'SELECT * FROM lab_rubric_criteria WHERE lab_id = $1 ORDER BY order_index',
        [labId]
      );

      // Get annotations
      const annotationsResult = await client.query(
        `SELECT lsa.*, lrc.criterion_name, lrc.max_points, creator.name as created_by_name
         FROM lab_score_annotations lsa
         JOIN lab_rubric_criteria lrc ON lsa.criterion_id = lrc.id
         LEFT JOIN users creator ON lsa.created_by = creator.id
         JOIN lab_scores ls ON lsa.score_id = ls.id
         WHERE ls.lab_id = $1 AND ls.student_id = $2
         ORDER BY lrc.order_index`,
        [labId, studentId]
      );

      // Calculate max possible score
      const maxScoreResult = await client.query(
        'SELECT SUM(max_points) as max_possible_score FROM lab_rubric_criteria WHERE lab_id = $1',
        [labId]
      );

      return NextResponse.json({
        score: scoreResult.rows[0] || null,
        criteria: criteriaResult.rows,
        annotations: annotationsResult.rows,
        maxPossibleScore: parseFloat(maxScoreResult.rows[0]?.max_possible_score) || 0,
        lab
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching student score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    );
  }
}