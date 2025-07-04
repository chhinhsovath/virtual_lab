import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '@/lib/lms-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const role = searchParams.get('role') || 'all'; // 'instructor', 'student', 'all'

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        SELECT DISTINCT
          c.id,
          c.code,
          c.title,
          c.title_km,
          c.description,
          c.description_km,
          c.credits,
          c.duration_weeks,
          c.start_date,
          c.end_date,
          c.max_students,
          c.department,
          c.is_active,
          c.created_at,
          c.updated_at,
          u.name as created_by_name,
          COUNT(DISTINCT ce.student_id) as enrolled_count,
          CASE 
            WHEN cs.instructor_id = $1 THEN 'instructor'
            WHEN ce_user.student_id = $1 THEN 'student'
            ELSE 'none'
          END as user_role,
          ARRAY_AGG(DISTINCT jsonb_build_object(
            'id', inst.id,
            'name', inst.name,
            'email', inst.email
          )) FILTER (WHERE inst.id IS NOT NULL) as instructors
        FROM lms_courses c
        LEFT JOIN users u ON c.created_by = u.id
        LEFT JOIN lms_course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN lms_course_enrollments ce_user ON c.id = ce_user.course_id AND ce_user.student_id = $1
        LEFT JOIN lms_course_schedules cs ON c.id = cs.course_id
        LEFT JOIN lms_course_schedules cs_user ON c.id = cs_user.course_id AND cs_user.instructor_id = $1
        LEFT JOIN users inst ON cs.instructor_id = inst.id
        WHERE 1=1
      `;

      const params: any[] = [session.user.id];
      let paramCount = 1;

      // Add search filter
      if (search) {
        paramCount++;
        query += ` AND (
          c.title ILIKE $${paramCount} OR 
          c.title_km ILIKE $${paramCount} OR 
          c.code ILIKE $${paramCount} OR
          c.description ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      // Add status filter
      if (status !== 'all') {
        paramCount++;
        query += ` AND c.is_active = $${paramCount}`;
        params.push(status === 'active');
      }

      // Add role filter
      if (role !== 'all') {
        if (role === 'instructor') {
          query += ` AND cs_user.instructor_id = $1`;
        } else if (role === 'student') {
          query += ` AND ce_user.student_id = $1`;
        }
      }

      // Check permissions - if not admin/teacher, only show enrolled/teaching courses
      const canViewAll = await hasLMSPermission(session.user.id, 'courses', 'read');
      if (!canViewAll && !['super_admin', 'admin'].includes(session.user.role_name)) {
        query += ` AND (cs_user.instructor_id = $1 OR ce_user.student_id = $1)`;
      }

      query += ` GROUP BY c.id, u.name, cs.instructor_id, ce_user.student_id`;
      query += ` ORDER BY c.created_at DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const coursesResult = await client.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(DISTINCT c.id) as total
        FROM lms_courses c
        LEFT JOIN lms_course_enrollments ce_user ON c.id = ce_user.course_id AND ce_user.student_id = $1
        LEFT JOIN lms_course_schedules cs_user ON c.id = cs_user.course_id AND cs_user.instructor_id = $1
        WHERE 1=1
      `;

      const countParams: any[] = [session.user.id];
      let countParamCount = 1;

      if (search) {
        countParamCount++;
        countQuery += ` AND (
          c.title ILIKE $${countParamCount} OR 
          c.title_km ILIKE $${countParamCount} OR 
          c.code ILIKE $${countParamCount} OR
          c.description ILIKE $${countParamCount}
        )`;
        countParams.push(`%${search}%`);
      }

      if (status !== 'all') {
        countParamCount++;
        countQuery += ` AND c.is_active = $${countParamCount}`;
        countParams.push(status === 'active');
      }

      if (role !== 'all') {
        if (role === 'instructor') {
          countQuery += ` AND cs_user.instructor_id = $1`;
        } else if (role === 'student') {
          countQuery += ` AND ce_user.student_id = $1`;
        }
      }

      if (!canViewAll && !['super_admin', 'admin'].includes(session.user.role_name)) {
        countQuery += ` AND (cs_user.instructor_id = $1 OR ce_user.student_id = $1)`;
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      await logActivity(session.user.id, 'course', 'list', { page, search });

      return NextResponse.json({
        courses: coursesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canCreate = await hasLMSPermission(session.user.id, 'courses', 'create');
    if (!canCreate) {
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
      schedules
    } = body;

    // Validate required fields
    if (!code || !title) {
      return NextResponse.json(
        { error: 'Code and title are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if course code already exists
      const existingCourse = await client.query(
        'SELECT id FROM lms_courses WHERE code = $1',
        [code]
      );

      if (existingCourse.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Course code already exists' },
          { status: 400 }
        );
      }

      // Create course
      const courseResult = await client.query(
        `INSERT INTO lms_courses 
         (code, title, title_km, description, description_km, credits, 
          duration_weeks, start_date, end_date, max_students, department, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          code,
          title,
          title_km,
          description,
          description_km,
          credits || 0,
          duration_weeks,
          start_date,
          end_date,
          max_students,
          department,
          session.user.id
        ]
      );

      const course = courseResult.rows[0];

      // Create schedules if provided
      if (schedules && Array.isArray(schedules)) {
        for (const schedule of schedules) {
          await client.query(
            `INSERT INTO lms_course_schedules 
             (course_id, day_of_week, start_time, end_time, room, instructor_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              course.id,
              schedule.day_of_week,
              schedule.start_time,
              schedule.end_time,
              schedule.room,
              schedule.instructor_id || session.user.id
            ]
          );
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'course',
        'create',
        { courseId: course.id, code: course.code },
        'courses',
        course.id
      );

      return NextResponse.json({
        message: 'Course created successfully',
        course
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}