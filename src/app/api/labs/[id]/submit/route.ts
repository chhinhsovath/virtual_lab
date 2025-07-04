import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, canAccessCourse, logActivity } from '@/lib/lms-auth';

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
    const { responses, isAutosave = false, sessionId } = body;

    if (!responses) {
      return NextResponse.json(
        { error: 'Responses are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and is published
      const labResult = await client.query(
        'SELECT id, course_id, title FROM lms_labs WHERE id = $1 AND is_published = true',
        [labId]
      );

      if (labResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Lab not found or not published' }, { status: 404 });
      }

      const lab = labResult.rows[0];

      // Check access permissions
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Verify enrollment
      const enrollmentResult = await client.query(
        'SELECT id FROM lms_course_enrollments WHERE course_id = $1 AND student_id = $2 AND status = $3',
        [lab.course_id, session.user.id, 'enrolled']
      );

      if (enrollmentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
      }

      // Get current active session
      let currentSession;
      if (sessionId) {
        const sessionResult = await client.query(
          'SELECT id, status FROM lab_sessions WHERE id = $1 AND student_id = $2',
          [sessionId, session.user.id]
        );
        
        if (sessionResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        currentSession = sessionResult.rows[0];
      } else {
        // Get most recent active session
        const sessionResult = await client.query(
          `SELECT id, status FROM lab_sessions 
           WHERE lab_id = $1 AND student_id = $2 AND status = 'in_progress'
           ORDER BY start_time DESC LIMIT 1`,
          [labId, session.user.id]
        );

        if (sessionResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'No active session found' }, { status: 400 });
        }

        currentSession = sessionResult.rows[0];
      }

      // Check if session is still active
      if (currentSession.status !== 'in_progress' && !isAutosave) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Session is no longer active' }, { status: 400 });
      }

      // Update or create submission
      if (isAutosave) {
        // For autosave, update autosave_data
        await client.query(
          `INSERT INTO lab_submissions (session_id, student_id, autosave_data)
           VALUES ($1, $2, $3)
           ON CONFLICT (session_id)
           DO UPDATE SET 
             autosave_data = $3,
             updated_at = CURRENT_TIMESTAMP`,
          [currentSession.id, session.user.id, JSON.stringify(responses)]
        );

        await client.query('COMMIT');

        return NextResponse.json({
          message: 'Progress auto-saved',
          sessionId: currentSession.id,
          timestamp: new Date().toISOString()
        });
      } else {
        // For final submission
        const submissionResult = await client.query(
          `INSERT INTO lab_submissions (session_id, student_id, responses, submitted_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (session_id)
           DO UPDATE SET 
             responses = $3,
             submitted_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [currentSession.id, session.user.id, JSON.stringify(responses)]
        );

        // Mark session as submitted
        await client.query(
          'UPDATE lab_sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['submitted', currentSession.id]
        );

        // Update student progress
        await client.query(
          `INSERT INTO lms_student_progress (student_id, course_id, completed_labs, last_activity)
           VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
           ON CONFLICT (student_id, course_id)
           DO UPDATE SET 
             completed_labs = lms_student_progress.completed_labs + 1,
             last_activity = CURRENT_TIMESTAMP`,
          [session.user.id, lab.course_id]
        );

        await client.query('COMMIT');

        await logActivity(
          session.user.id,
          'lab_submission',
          'submit',
          {
            labId,
            sessionId: currentSession.id,
            submissionId: submissionResult.rows[0].id,
            responseCount: Object.keys(responses).length
          },
          'labs',
          labId
        );

        return NextResponse.json({
          message: 'Lab submitted successfully',
          submission: submissionResult.rows[0],
          sessionId: currentSession.id
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting lab:', error);
    return NextResponse.json(
      { error: 'Failed to submit lab responses' },
      { status: 500 }
    );
  }
}