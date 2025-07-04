import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db';
import { getLMSSession, logActivity } from '../../../../../lib/lms-auth';

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
    const { sessionId, reason = 'manual' } = body; // reason: 'manual', 'timeout', 'submission'

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get the active session
      let currentSession;
      if (sessionId) {
        const sessionResult = await client.query(
          'SELECT * FROM lab_sessions WHERE id = $1 AND student_id = $2',
          [sessionId, session.user.id]
        );
        
        if (sessionResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        
        currentSession = sessionResult.rows[0];
      } else {
        // Get most recent active session for this lab
        const sessionResult = await client.query(
          `SELECT * FROM lab_sessions 
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

      // Check if session is already ended
      if (currentSession.end_time) {
        await client.query('COMMIT');
        return NextResponse.json({
          message: 'Session already ended',
          session: currentSession
        });
      }

      // Calculate duration
      const endTime = new Date();
      const startTime = new Date(currentSession.start_time);
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Update session with end time and duration
      const updatedSessionResult = await client.query(
        `UPDATE lab_sessions 
         SET end_time = $1, duration_minutes = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [endTime, durationMinutes, currentSession.id]
      );

      const updatedSession = updatedSessionResult.rows[0];

      // Get lab information for logging
      const labResult = await client.query(
        'SELECT title, course_id FROM lms_labs WHERE id = $1',
        [labId]
      );

      const lab = labResult.rows[0];

      // Update student progress tracking
      await client.query(
        `INSERT INTO lms_student_progress (student_id, course_id, time_spent_minutes, last_activity)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, course_id)
         DO UPDATE SET 
           time_spent_minutes = lms_student_progress.time_spent_minutes + $3,
           last_activity = CURRENT_TIMESTAMP`,
        [session.user.id, lab.course_id, durationMinutes]
      );

      // Get submission status
      const submissionResult = await client.query(
        'SELECT id, submitted_at FROM lab_submissions WHERE session_id = $1',
        [currentSession.id]
      );

      const hasSubmission = submissionResult.rows.length > 0;
      const submission = hasSubmission ? submissionResult.rows[0] : null;

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_session',
        'stop',
        {
          labId,
          sessionId: currentSession.id,
          durationMinutes,
          reason,
          hasSubmission,
          labTitle: lab.title
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Lab session ended successfully',
        session: updatedSession,
        summary: {
          durationMinutes,
          startTime: currentSession.start_time,
          endTime: endTime.toISOString(),
          hasSubmission,
          submittedAt: submission?.submitted_at || null,
          reason
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error stopping lab session:', error);
    return NextResponse.json(
      { error: 'Failed to stop lab session' },
      { status: 500 }
    );
  }
}