import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const session = await getSession();
  if (!session || session.user_role !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const body = await request.json();
    const { scores, feedbacks, overall_feedback, is_draft } = body;

    // Get current submission details
    const submissionResult = await client.query(
      'SELECT * FROM student_exercise_submissions WHERE id = $1',
      [params.submissionId]
    );

    if (submissionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = submissionResult.rows[0];
    const currentDetails = submission.details || {};

    // Update details with scores and feedback
    const updatedDetails = { ...currentDetails };
    for (const [exerciseId, score] of Object.entries(scores)) {
      if (!updatedDetails[exerciseId]) {
        updatedDetails[exerciseId] = {};
      }
      updatedDetails[exerciseId].points_earned = score;
      updatedDetails[exerciseId].is_correct = score > 0;
    }

    for (const [exerciseId, feedback] of Object.entries(feedbacks)) {
      if (!updatedDetails[exerciseId]) {
        updatedDetails[exerciseId] = {};
      }
      updatedDetails[exerciseId].feedback = feedback;
    }

    // Calculate total score
    const totalScore = Object.values(scores).reduce((sum: number, score: any) => sum + (parseInt(score) || 0), 0);

    // Update submission
    const updateQuery = `
      UPDATE student_exercise_submissions
      SET 
        details = $1,
        total_score = $2,
        teacher_feedback = $3,
        graded_at = $4,
        graded_by = $5,
        is_graded = $6
      WHERE id = $7
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [
      JSON.stringify(updatedDetails),
      totalScore,
      overall_feedback,
      is_draft ? null : new Date(),
      session.user_id,
      !is_draft,
      params.submissionId
    ]);

    // Log grading activity
    await client.query(`
      INSERT INTO activity_logs (
        student_id, 
        teacher_id, 
        action_type, 
        action_description,
        metadata
      ) VALUES (
        $1, $2, $3, $4, $5
      )
    `, [
      submission.student_id,
      session.user_id,
      is_draft ? 'grade_draft' : 'grade_submit',
      is_draft ? 'Teacher saved grading draft' : 'Teacher submitted final grades',
      JSON.stringify({
        submission_id: params.submissionId,
        total_score: totalScore,
        max_score: submission.max_score
      })
    ]);

    return NextResponse.json({
      success: true,
      submission: updateResult.rows[0],
      message: is_draft ? 'Grading saved as draft' : 'Grading submitted successfully'
    });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}