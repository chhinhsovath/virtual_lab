import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, canAccessCourse, logActivity } from '@/lib/lms-auth';

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
    const studentId = searchParams.get('student_id') || session.user.id;

    const client = await pool.connect();
    try {
      // Get lab details first to check course access
      const labResult = await client.query(
        'SELECT course_id FROM lms_labs WHERE id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const courseId = labResult.rows[0].course_id;
      const canAccess = await canAccessCourse(session.user.id, courseId, 'read');

      if (!canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // If requesting another student's data, check permissions
      if (studentId !== session.user.id) {
        const canViewOthers = ['super_admin', 'admin', 'teacher'].includes(session.user.role_name);
        if (!canViewOthers) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      // Get all activities for this student and lab
      const activitiesQuery = `
        SELECT 
          sla.*,
          u.name as student_name,
          u.email as student_email,
          l.title as lab_title,
          l.max_attempts
        FROM lms_student_lab_activities sla
        LEFT JOIN users u ON sla.student_id = u.id
        LEFT JOIN lms_labs l ON sla.lab_id = l.id
        WHERE sla.lab_id = $1 AND sla.student_id = $2
        ORDER BY sla.created_at DESC
      `;

      const activitiesResult = await client.query(activitiesQuery, [labId, studentId]);

      // Calculate summary statistics
      const activities = activitiesResult.rows;
      const totalAttempts = activities.length;
      const completedAttempts = activities.filter(a => a.status === 'submitted').length;
      const bestScore = activities.reduce((max, a) => a.score > max ? a.score : max, 0);
      const totalTimeSpent = activities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);
      const averageScore = completedAttempts > 0 
        ? activities.filter(a => a.status === 'submitted').reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts
        : 0;

      const summary = {
        totalAttempts,
        completedAttempts,
        bestScore,
        averageScore,
        totalTimeSpent,
        maxAttempts: activities[0]?.max_attempts || 3,
        attemptsRemaining: Math.max(0, (activities[0]?.max_attempts || 3) - totalAttempts),
        latestStatus: activities[0]?.status || 'not_started'
      };

      return NextResponse.json({
        activities,
        summary
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab activity' },
      { status: 500 }
    );
  }
}

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
    const { action, worksheet_answers, simulation_data, ip_address, user_agent } = body;

    const client = await pool.connect();
    try {
      // Get lab details and check access
      const labQuery = `
        SELECT l.*, c.id as course_id
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        WHERE l.id = $1
      `;

      const labResult = await client.query(labQuery, [labId]);
      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];

      // Check if lab is published
      if (!lab.is_published) {
        return NextResponse.json({ error: 'Lab is not published' }, { status: 400 });
      }

      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Check if student is enrolled
      const enrollmentResult = await client.query(
        'SELECT id FROM lms_course_enrollments WHERE course_id = $1 AND student_id = $2 AND status = $3',
        [lab.course_id, session.user.id, 'enrolled']
      );

      if (enrollmentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
      }

      const enrollmentId = enrollmentResult.rows[0].id;

      await client.query('BEGIN');

      if (action === 'start') {
        // Check attempt limits
        const attemptCountResult = await client.query(
          'SELECT COUNT(*) as count FROM lms_student_lab_activities WHERE lab_id = $1 AND student_id = $2',
          [labId, session.user.id]
        );

        const currentAttempts = parseInt(attemptCountResult.rows[0].count);
        if (currentAttempts >= lab.max_attempts) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: `Maximum attempts (${lab.max_attempts}) exceeded` },
            { status: 400 }
          );
        }

        // Check for existing in-progress activity
        const inProgressResult = await client.query(
          `SELECT id FROM lms_student_lab_activities 
           WHERE lab_id = $1 AND student_id = $2 AND status = 'in_progress'`,
          [labId, session.user.id]
        );

        if (inProgressResult.rows.length > 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Activity already in progress', activityId: inProgressResult.rows[0].id },
            { status: 400 }
          );
        }

        // Create new activity
        const activityResult = await client.query(
          `INSERT INTO lms_student_lab_activities 
           (lab_id, student_id, course_enrollment_id, attempt_number, status, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, 'in_progress', $5, $6)
           RETURNING *`,
          [labId, session.user.id, enrollmentId, currentAttempts + 1, ip_address, user_agent]
        );

        const activity = activityResult.rows[0];

        await client.query('COMMIT');

        await logActivity(
          session.user.id,
          'lab_activity',
          'start',
          { labId, activityId: activity.id, attempt: currentAttempts + 1 },
          'labs',
          labId
        );

        return NextResponse.json({
          message: 'Lab activity started',
          activity
        });

      } else if (action === 'update') {
        // Update existing in-progress activity
        const activityResult = await client.query(
          `UPDATE lms_student_lab_activities 
           SET 
             worksheet_answers = COALESCE($1, worksheet_answers),
             simulation_data = COALESCE($2, simulation_data),
             updated_at = CURRENT_TIMESTAMP
           WHERE lab_id = $3 AND student_id = $4 AND status = 'in_progress'
           RETURNING *`,
          [
            worksheet_answers ? JSON.stringify(worksheet_answers) : null,
            simulation_data ? JSON.stringify(simulation_data) : null,
            labId,
            session.user.id
          ]
        );

        if (activityResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'No in-progress activity found' },
            { status: 400 }
          );
        }

        await client.query('COMMIT');

        return NextResponse.json({
          message: 'Activity updated',
          activity: activityResult.rows[0]
        });

      } else if (action === 'submit') {
        // Submit activity
        const currentTime = new Date();
        
        const activityResult = await client.query(
          `UPDATE lms_student_lab_activities 
           SET 
             end_time = $1,
             duration_minutes = EXTRACT(EPOCH FROM ($1 - start_time)) / 60,
             worksheet_answers = COALESCE($2, worksheet_answers),
             simulation_data = COALESCE($3, simulation_data),
             status = 'submitted',
             updated_at = CURRENT_TIMESTAMP
           WHERE lab_id = $4 AND student_id = $5 AND status = 'in_progress'
           RETURNING *`,
          [
            currentTime,
            worksheet_answers ? JSON.stringify(worksheet_answers) : null,
            simulation_data ? JSON.stringify(simulation_data) : null,
            labId,
            session.user.id
          ]
        );

        if (activityResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'No in-progress activity found' },
            { status: 400 }
          );
        }

        const activity = activityResult.rows[0];

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
          'lab_activity',
          'submit',
          { 
            labId, 
            activityId: activity.id, 
            durationMinutes: activity.duration_minutes 
          },
          'labs',
          labId
        );

        return NextResponse.json({
          message: 'Activity submitted successfully',
          activity
        });

      } else {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Invalid action. Must be start, update, or submit' },
          { status: 400 }
        );
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error managing lab activity:', error);
    return NextResponse.json(
      { error: 'Failed to manage lab activity' },
      { status: 500 }
    );
  }
}