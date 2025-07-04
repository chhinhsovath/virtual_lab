import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '../../../../lib/lms-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;
    const canAccess = await canAccessCourse(session.user.id, courseId, 'read');
    
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Get course details
      const courseQuery = `
        SELECT 
          c.*,
          u.name as created_by_name,
          COUNT(DISTINCT ce.student_id) as enrolled_count,
          COUNT(DISTINCT l.id) as labs_count,
          COUNT(DISTINCT a.id) as assignments_count
        FROM lms_courses c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN lms_course_enrollments ce ON c.id = ce.course_id AND ce.status = 'enrolled'
        LEFT JOIN lms_labs l ON c.id = l.course_id AND l.is_published = true
        LEFT JOIN lms_assignments a ON c.id = a.course_id AND a.is_published = true
        WHERE c.id = $1
        GROUP BY c.id, u.name
      `;

      const courseResult = await client.query(courseQuery, [courseId]);
      if (courseResult.rows.length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const course = courseResult.rows[0];

      // Get schedules
      const schedulesQuery = `
        SELECT 
          cs.*,
          u.name as instructor_name,
          u.email as instructor_email
        FROM lms_course_schedules cs
        LEFT JOIN users u ON cs.instructor_id = u.id
        WHERE cs.course_id = $1
        ORDER BY cs.day_of_week, cs.start_time
      `;

      const schedulesResult = await client.query(schedulesQuery, [courseId]);

      // Get enrolled students (if user has permission)
      let students = [];
      const canViewStudents = await hasLMSPermission(session.user.id, 'users', 'read') ||
        await canAccessCourse(session.user.id, courseId, 'write');
      
      if (canViewStudents) {
        const studentsQuery = `
          SELECT 
            ce.enrollment_date,
            ce.status,
            ce.grade,
            u.id,
            u.name,
            u.email,
            sp.average_score,
            sp.completed_assignments,
            sp.total_assignments,
            sp.completed_labs,
            sp.total_labs,
            sp.time_spent_minutes,
            sp.last_activity
          FROM lms_course_enrollments ce
          JOIN users u ON ce.student_id = u.id
          LEFT JOIN lms_student_progress sp ON u.id = sp.student_id AND sp.course_id = $1
          WHERE ce.course_id = $1
          ORDER BY u.name
        `;

        const studentsResult = await client.query(studentsQuery, [courseId]);
        students = studentsResult.rows;
      }

      // Get recent labs
      const labsQuery = `
        SELECT 
          id,
          title,
          title_km,
          description,
          duration_minutes,
          is_published,
          created_at
        FROM lms_labs
        WHERE course_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `;

      const labsResult = await client.query(labsQuery, [courseId]);

      // Get recent assignments
      const assignmentsQuery = `
        SELECT 
          id,
          title,
          title_km,
          assignment_type,
          total_points,
          due_date,
          is_published,
          created_at
        FROM lms_assignments
        WHERE course_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `;

      const assignmentsResult = await client.query(assignmentsQuery, [courseId]);

      await logActivity(
        session.user.id,
        'course',
        'view',
        { courseId },
        'courses',
        courseId
      );

      return NextResponse.json({
        course,
        schedules: schedulesResult.rows,
        students,
        recentLabs: labsResult.rows,
        recentAssignments: assignmentsResult.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;
    const canUpdate = await hasLMSPermission(session.user.id, 'courses', 'update');
    const canAccess = await canAccessCourse(session.user.id, courseId, 'write');

    if (!canUpdate && !canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      title,
      title_km,
      description,
      description_km,
      credits,
      duration_weeks,
      start_date,
      end_date,
      max_students,
      department,
      is_active,
      schedules
    } = body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if course exists
      const existingCourse = await client.query(
        'SELECT id, code FROM lms_courses WHERE id = $1',
        [courseId]
      );

      if (existingCourse.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      // Check if new code conflicts with another course
      if (code && code !== existingCourse.rows[0].code) {
        const codeConflict = await client.query(
          'SELECT id FROM lms_courses WHERE code = $1 AND id != $2',
          [code, courseId]
        );

        if (codeConflict.rows.length > 0) {
          await client.query('ROLLBACK');
          return NextResponse.json(
            { error: 'Course code already exists' },
            { status: 400 }
          );
        }
      }

      // Update course
      const updateQuery = `
        UPDATE lms_courses 
        SET 
          code = COALESCE($1, code),
          title = COALESCE($2, title),
          title_km = COALESCE($3, title_km),
          description = COALESCE($4, description),
          description_km = COALESCE($5, description_km),
          credits = COALESCE($6, credits),
          duration_weeks = COALESCE($7, duration_weeks),
          start_date = COALESCE($8, start_date),
          end_date = COALESCE($9, end_date),
          max_students = COALESCE($10, max_students),
          department = COALESCE($11, department),
          is_active = COALESCE($12, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `;

      const courseResult = await client.query(updateQuery, [
        code,
        title,
        title_km,
        description,
        description_km,
        credits,
        duration_weeks,
        start_date,
        end_date,
        max_students,
        department,
        is_active,
        courseId
      ]);

      // Update schedules if provided
      if (schedules && Array.isArray(schedules)) {
        // Delete existing schedules
        await client.query(
          'DELETE FROM lms_course_schedules WHERE course_id = $1',
          [courseId]
        );

        // Insert new schedules
        for (const schedule of schedules) {
          await client.query(
            `INSERT INTO lms_course_schedules 
             (course_id, day_of_week, start_time, end_time, room, instructor_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              courseId,
              schedule.day_of_week,
              schedule.start_time,
              schedule.end_time,
              schedule.room,
              schedule.instructor_id
            ]
          );
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'course',
        'update',
        { courseId, changes: Object.keys(body) },
        'courses',
        courseId
      );

      return NextResponse.json({
        message: 'Course updated successfully',
        course: courseResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;
    const canDelete = await hasLMSPermission(session.user.id, 'courses', 'delete');

    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Check if course has enrollments or submissions
      const dependenciesQuery = `
        SELECT 
          COUNT(DISTINCT ce.id) as enrollments,
          COUNT(DISTINCT s.id) as submissions
        FROM lms_courses c
        LEFT JOIN lms_course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN lms_assignments a ON c.id = a.course_id
        LEFT JOIN lms_submissions s ON a.id = s.assignment_id
        WHERE c.id = $1
      `;

      const dependenciesResult = await client.query(dependenciesQuery, [courseId]);
      const { enrollments, submissions } = dependenciesResult.rows[0];

      if (parseInt(enrollments) > 0 || parseInt(submissions) > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot delete course with existing enrollments or submissions',
            details: { enrollments: parseInt(enrollments), submissions: parseInt(submissions) }
          },
          { status: 400 }
        );
      }

      // Soft delete by marking as inactive
      await client.query(
        'UPDATE lms_courses SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [courseId]
      );

      await logActivity(
        session.user.id,
        'course',
        'delete',
        { courseId },
        'courses',
        courseId
      );

      return NextResponse.json({
        message: 'Course deactivated successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}