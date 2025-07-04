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

    const courseId = params.id;
    const canAccess = await canAccessCourse(session.user.id, courseId, 'read');
    
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          ce.id,
          ce.enrollment_date,
          ce.status,
          ce.grade,
          ce.completion_date,
          u.id as student_id,
          u.name as student_name,
          u.email as student_email,
          u.phone_number as student_phone,
          sp.average_score,
          sp.completed_assignments,
          sp.total_assignments,
          sp.completed_labs,
          sp.total_labs,
          sp.time_spent_minutes,
          sp.last_activity,
          COUNT(DISTINCT att.id) FILTER (WHERE att.status = 'present') as attendance_present,
          COUNT(DISTINCT att.id) as attendance_total
        FROM lms_course_enrollments ce
        JOIN users u ON ce.student_id = u.id
        LEFT JOIN lms_student_progress sp ON u.id = sp.student_id AND sp.course_id = $1
        LEFT JOIN lms_course_schedules cs ON cs.course_id = $1
        LEFT JOIN lms_attendance att ON att.course_schedule_id = cs.id AND att.student_id = u.id
        WHERE ce.course_id = $1
      `;

      const params: any[] = [courseId];
      let paramCount = 1;

      // Add status filter
      if (status !== 'all') {
        paramCount++;
        query += ` AND ce.status = $${paramCount}`;
        params.push(status);
      }

      // Add search filter
      if (search) {
        paramCount++;
        query += ` AND (
          u.name ILIKE $${paramCount} OR 
          u.email ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      query += ` 
        GROUP BY ce.id, u.id, u.name, u.email, u.phone_number, 
                 sp.average_score, sp.completed_assignments, sp.total_assignments,
                 sp.completed_labs, sp.total_labs, sp.time_spent_minutes, sp.last_activity
        ORDER BY ce.enrollment_date DESC
      `;

      const result = await client.query(query, params);

      return NextResponse.json({
        enrollments: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
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

    const courseId = params.id;
    const canEnroll = await hasLMSPermission(session.user.id, 'courses', 'update');
    
    if (!canEnroll) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { student_ids, bulk = false } = body;

    if (!student_ids || !Array.isArray(student_ids)) {
      return NextResponse.json(
        { error: 'student_ids array is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if course exists and get max students
      const courseResult = await client.query(
        'SELECT id, max_students, title FROM lms_courses WHERE id = $1',
        [courseId]
      );

      if (courseResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const course = courseResult.rows[0];

      // Check current enrollment count
      const currentEnrollmentResult = await client.query(
        'SELECT COUNT(*) as count FROM lms_course_enrollments WHERE course_id = $1 AND status = $2',
        [courseId, 'enrolled']
      );

      const currentEnrollments = parseInt(currentEnrollmentResult.rows[0].count);
      const availableSlots = course.max_students ? course.max_students - currentEnrollments : null;

      if (availableSlots !== null && student_ids.length > availableSlots) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            error: `Cannot enroll ${student_ids.length} students. Only ${availableSlots} slots available.`,
            available_slots: availableSlots
          },
          { status: 400 }
        );
      }

      const enrollmentResults = [];
      const errors = [];

      for (const studentId of student_ids) {
        try {
          // Check if student exists
          const studentResult = await client.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [studentId]
          );

          if (studentResult.rows.length === 0) {
            errors.push({ studentId, error: 'Student not found' });
            continue;
          }

          const student = studentResult.rows[0];

          // Check if already enrolled
          const existingEnrollment = await client.query(
            'SELECT id, status FROM lms_course_enrollments WHERE course_id = $1 AND student_id = $2',
            [courseId, studentId]
          );

          if (existingEnrollment.rows.length > 0) {
            const status = existingEnrollment.rows[0].status;
            if (status === 'enrolled') {
              errors.push({ 
                studentId, 
                studentName: student.name,
                error: 'Already enrolled' 
              });
              continue;
            } else if (status === 'dropped') {
              // Re-enroll dropped student
              await client.query(
                'UPDATE lms_course_enrollments SET status = $1, enrollment_date = CURRENT_TIMESTAMP WHERE id = $2',
                ['enrolled', existingEnrollment.rows[0].id]
              );
              
              enrollmentResults.push({
                studentId,
                studentName: student.name,
                studentEmail: student.email,
                status: 'enrolled',
                action: 're-enrolled'
              });
              continue;
            }
          }

          // Create new enrollment
          const enrollmentResult = await client.query(
            `INSERT INTO lms_course_enrollments (course_id, student_id, status)
             VALUES ($1, $2, 'enrolled')
             RETURNING *`,
            [courseId, studentId]
          );

          // Initialize student progress tracking
          await client.query(
            `INSERT INTO lms_student_progress (student_id, course_id)
             VALUES ($1, $2)
             ON CONFLICT (student_id, course_id) DO NOTHING`,
            [studentId, courseId]
          );

          enrollmentResults.push({
            studentId,
            studentName: student.name,
            studentEmail: student.email,
            status: 'enrolled',
            action: 'enrolled',
            enrollmentDate: enrollmentResult.rows[0].enrollment_date
          });

        } catch (error) {
          console.error(`Error enrolling student ${studentId}:`, error);
          errors.push({ 
            studentId, 
            error: 'Enrollment failed' 
          });
        }
      }

      await client.query('COMMIT');

      // Log activity
      await logActivity(
        session.user.id,
        'enrollment',
        'bulk_enroll',
        { 
          courseId, 
          courseTitle: course.title,
          enrolled: enrollmentResults.length,
          errors: errors.length 
        },
        'courses',
        courseId
      );

      return NextResponse.json({
        message: `Enrollment completed. ${enrollmentResults.length} students enrolled, ${errors.length} errors.`,
        enrollments: enrollmentResults,
        errors
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json(
      { error: 'Failed to enroll students' },
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
    const canUnenroll = await hasLMSPermission(session.user.id, 'courses', 'update');
    
    if (!canUnenroll) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: 'student_id is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if enrollment exists
      const enrollmentResult = await client.query(
        `SELECT ce.id, u.name as student_name
         FROM lms_course_enrollments ce
         JOIN users u ON ce.student_id = u.id
         WHERE ce.course_id = $1 AND ce.student_id = $2`,
        [courseId, student_id]
      );

      if (enrollmentResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Enrollment not found' },
          { status: 404 }
        );
      }

      const enrollment = enrollmentResult.rows[0];

      // Check for existing submissions
      const submissionsResult = await client.query(
        `SELECT COUNT(*) as count
         FROM lms_submissions s
         JOIN lms_assignments a ON s.assignment_id = a.id
         WHERE a.course_id = $1 AND s.student_id = $2`,
        [courseId, student_id]
      );

      const hasSubmissions = parseInt(submissionsResult.rows[0].count) > 0;

      if (hasSubmissions) {
        // Mark as dropped instead of deleting
        await client.query(
          'UPDATE lms_course_enrollments SET status = $1 WHERE id = $2',
          ['dropped', enrollment.id]
        );

        await logActivity(
          session.user.id,
          'enrollment',
          'drop',
          { 
            courseId, 
            studentId: student_id,
            studentName: enrollment.student_name,
            reason: 'Has submissions' 
          },
          'courses',
          courseId
        );

        return NextResponse.json({
          message: 'Student dropped from course (has existing submissions)',
          action: 'dropped'
        });
      } else {
        // Delete enrollment and progress
        await client.query('BEGIN');
        
        await client.query(
          'DELETE FROM lms_student_progress WHERE student_id = $1 AND course_id = $2',
          [student_id, courseId]
        );
        
        await client.query(
          'DELETE FROM lms_course_enrollments WHERE id = $1',
          [enrollment.id]
        );

        await client.query('COMMIT');

        await logActivity(
          session.user.id,
          'enrollment',
          'remove',
          { 
            courseId, 
            studentId: student_id,
            studentName: enrollment.student_name 
          },
          'courses',
          courseId
        );

        return NextResponse.json({
          message: 'Student removed from course',
          action: 'removed'
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error removing enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to remove enrollment' },
      { status: 500 }
    );
  }
}