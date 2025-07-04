import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db';
import { getLMSSession, canAccessCourse, logActivity } from '../../../../../lib/lms-auth';

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
    const { userAgent, ipAddress } = body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and is published
      const labResult = await client.query(
        `SELECT l.*, c.id as course_id, c.title as course_title
         FROM lms_labs l
         LEFT JOIN lms_courses c ON l.course_id = c.id
         WHERE l.id = $1 AND l.is_published = true`,
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

      // Check if there's already an active session
      const activeSessionResult = await client.query(
        'SELECT id, start_time FROM lab_sessions WHERE lab_id = $1 AND student_id = $2 AND status = $3',
        [labId, session.user.id, 'in_progress']
      );

      if (activeSessionResult.rows.length > 0) {
        const existingSession = activeSessionResult.rows[0];
        
        await client.query('COMMIT');
        
        return NextResponse.json({
          message: 'Session already active',
          session: existingSession,
          isResuming: true
        });
      }

      // Check lab attempt limits if configured
      if (lab.max_attempts && lab.max_attempts > 0) {
        const attemptCountResult = await client.query(
          'SELECT COUNT(*) as attempt_count FROM lab_sessions WHERE lab_id = $1 AND student_id = $2',
          [labId, session.user.id]
        );

        const attemptCount = parseInt(attemptCountResult.rows[0].attempt_count);
        if (attemptCount >= lab.max_attempts) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { 
              error: `Maximum attempts (${lab.max_attempts}) exceeded`,
              maxAttempts: lab.max_attempts,
              currentAttempts: attemptCount
            },
            { status: 400 }
          );
        }
      }

      // Create new lab session
      const sessionResult = await client.query(
        `INSERT INTO lab_sessions (lab_id, student_id, start_time, status)
         VALUES ($1, $2, CURRENT_TIMESTAMP, 'in_progress')
         RETURNING *`,
        [labId, session.user.id]
      );

      const newSession = sessionResult.rows[0];

      // Get lab resources (simulation URL, etc.)
      const resourcesResult = await client.query(
        `SELECT resource_type, file_url, title
         FROM lms_lab_resources 
         WHERE lab_id = $1
         ORDER BY resource_type`,
        [labId]
      );

      const resources = resourcesResult.rows.reduce((acc, resource) => {
        acc[resource.resource_type] = {
          url: resource.file_url,
          title: resource.title
        };
        return acc;
      }, {});

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_session',
        'start',
        {
          labId,
          sessionId: newSession.id,
          labTitle: lab.title,
          courseId: lab.course_id,
          userAgent,
          ipAddress
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Lab session started successfully',
        session: newSession,
        lab: {
          id: lab.id,
          title: lab.title,
          description: lab.description,
          subject: lab.subject,
          grade: lab.grade,
          duration_minutes: lab.duration_minutes,
          max_attempts: lab.max_attempts
        },
        resources,
        isResuming: false
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error starting lab session:', error);
    return NextResponse.json(
      { error: 'Failed to start lab session' },
      { status: 500 }
    );
  }
}