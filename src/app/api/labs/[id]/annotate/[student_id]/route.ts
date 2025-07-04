import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '@/lib/lms-auth';

export async function POST(
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

    // Check permissions - only teachers/admins can add comments
    const canAnnotate = await hasLMSPermission(session.user.id, 'assessments', 'update');
    if (!canAnnotate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      criterion_id,
      points_awarded,
      teacher_comment,
      annotation_type = 'feedback'
    } = body;

    if (!criterion_id || teacher_comment === undefined) {
      return NextResponse.json(
        { error: 'criterion_id and teacher_comment are required' },
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

      // Verify criterion exists for this lab
      const criterionResult = await client.query(
        'SELECT * FROM lab_rubric_criteria WHERE id = $1 AND lab_id = $2',
        [criterion_id, labId]
      );

      if (criterionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Criterion not found' }, { status: 404 });
      }

      const criterion = criterionResult.rows[0];

      // Get or create score record
      const scoreResult = await client.query(
        `INSERT INTO lab_scores (student_id, lab_id, graded_by, graded_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, lab_id)
         DO UPDATE SET 
           graded_by = $3,
           graded_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [studentId, labId, session.user.id]
      );

      const score = scoreResult.rows[0];

      // Create or update annotation
      const annotationResult = await client.query(
        `INSERT INTO lab_score_annotations 
         (score_id, criterion_id, points_awarded, teacher_comment, annotation_type, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (score_id, criterion_id)
         DO UPDATE SET 
           points_awarded = $3,
           teacher_comment = $4,
           annotation_type = $5,
           created_by = $6,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [score.id, criterion_id, points_awarded, teacher_comment, annotation_type, session.user.id]
      );

      const annotation = annotationResult.rows[0];

      // Update rubric breakdown in score record
      const allAnnotationsResult = await client.query(
        `SELECT lsa.*, lrc.criterion_name, lrc.max_points
         FROM lab_score_annotations lsa
         JOIN lab_rubric_criteria lrc ON lsa.criterion_id = lrc.id
         WHERE lsa.score_id = $1`,
        [score.id]
      );

      // Build updated rubric breakdown
      const rubricBreakdown: any = {};
      let manualScoreTotal = 0;

      for (const anno of allAnnotationsResult.rows) {
        rubricBreakdown[anno.criterion_id] = {
          name: anno.criterion_name,
          max_points: parseFloat(anno.max_points),
          awarded_points: parseFloat(anno.points_awarded) || 0,
          teacher_comment: anno.teacher_comment,
          annotation_type: anno.annotation_type,
          percentage: anno.max_points > 0 ? 
            ((parseFloat(anno.points_awarded) || 0) / parseFloat(anno.max_points)) * 100 : 0
        };
        manualScoreTotal += parseFloat(anno.points_awarded) || 0;
      }

      // Update score with new rubric breakdown and manual score
      await client.query(
        `UPDATE lab_scores 
         SET rubric_breakdown = $1, manual_score = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [JSON.stringify(rubricBreakdown), manualScoreTotal, score.id]
      );

      // Get student info for logging
      const studentResult = await client.query(
        'SELECT name FROM users WHERE id = $1',
        [studentId]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_assessment',
        'annotate',
        {
          labId,
          studentId,
          studentName: studentResult.rows[0]?.name,
          criterionId: criterion_id,
          criterionName: criterion.criterion_name,
          pointsAwarded: points_awarded,
          annotationType: annotation_type,
          hasComment: !!teacher_comment
        },
        'labs',
        labId
      );

      // Return annotation with criterion details
      const enrichedAnnotation = {
        ...annotation,
        criterion_name: criterion.criterion_name,
        criterion_max_points: criterion.max_points
      };

      return NextResponse.json({
        message: 'Annotation added successfully',
        annotation: enrichedAnnotation,
        rubricBreakdown,
        totalScore: manualScoreTotal
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error adding lab annotation:', error);
    return NextResponse.json(
      { error: 'Failed to add annotation' },
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

      // Get all annotations for this student and lab
      const annotationsResult = await client.query(
        `SELECT 
           lsa.*,
           lrc.criterion_name,
           lrc.criterion_description,
           lrc.max_points,
           lrc.order_index,
           creator.name as created_by_name,
           creator.email as created_by_email
         FROM lab_score_annotations lsa
         JOIN lab_rubric_criteria lrc ON lsa.criterion_id = lrc.id
         LEFT JOIN users creator ON lsa.created_by = creator.id
         JOIN lab_scores ls ON lsa.score_id = ls.id
         WHERE ls.lab_id = $1 AND ls.student_id = $2
         ORDER BY lrc.order_index, lsa.created_at DESC`,
        [labId, studentId]
      );

      // Get rubric criteria (including those without annotations)
      const criteriaResult = await client.query(
        'SELECT * FROM lab_rubric_criteria WHERE lab_id = $1 ORDER BY order_index',
        [labId]
      );

      // Get overall score info
      const scoreResult = await client.query(
        'SELECT * FROM lab_scores WHERE lab_id = $1 AND student_id = $2',
        [labId, studentId]
      );

      // Group annotations by criterion
      const annotationsByCriterion: any = {};
      for (const annotation of annotationsResult.rows) {
        if (!annotationsByCriterion[annotation.criterion_id]) {
          annotationsByCriterion[annotation.criterion_id] = [];
        }
        annotationsByCriterion[annotation.criterion_id].push(annotation);
      }

      return NextResponse.json({
        annotations: annotationsResult.rows,
        annotationsByCriterion,
        criteria: criteriaResult.rows,
        score: scoreResult.rows[0] || null,
        lab
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const canAnnotate = await hasLMSPermission(session.user.id, 'assessments', 'update');
    if (!canAnnotate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { annotation_id, points_awarded, teacher_comment, annotation_type } = body;

    if (!annotation_id) {
      return NextResponse.json(
        { error: 'annotation_id is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update annotation
      const annotationResult = await client.query(
        `UPDATE lab_score_annotations 
         SET 
           points_awarded = COALESCE($1, points_awarded),
           teacher_comment = COALESCE($2, teacher_comment),
           annotation_type = COALESCE($3, annotation_type),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [points_awarded, teacher_comment, annotation_type, annotation_id]
      );

      if (annotationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
      }

      const annotation = annotationResult.rows[0];

      // Recalculate total manual score
      const totalScoreResult = await client.query(
        `SELECT SUM(points_awarded) as total_score
         FROM lab_score_annotations
         WHERE score_id = $1`,
        [annotation.score_id]
      );

      const totalScore = parseFloat(totalScoreResult.rows[0].total_score) || 0;

      // Update the lab score
      await client.query(
        'UPDATE lab_scores SET manual_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [totalScore, annotation.score_id]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_assessment',
        'update_annotation',
        {
          labId,
          studentId,
          annotationId: annotation_id,
          newScore: points_awarded
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Annotation updated successfully',
        annotation,
        totalScore
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating lab annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}