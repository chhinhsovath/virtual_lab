import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '../../../lib/lms-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('course_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all'; // 'published', 'draft', 'all'
    const type = searchParams.get('type') || 'all';
    const dueDateFilter = searchParams.get('due_date') || 'all'; // 'upcoming', 'overdue', 'all'

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        SELECT 
          a.*,
          c.title as course_title,
          c.code as course_code,
          u.name as created_by_name,
          COUNT(DISTINCT s.student_id) as submissions_count,
          COUNT(DISTINCT s.student_id) FILTER (WHERE s.status = 'submitted') as submitted_count,
          COUNT(DISTINCT s.student_id) FILTER (WHERE s.status = 'graded') as graded_count,
          AVG(s.score) FILTER (WHERE s.status = 'graded') as average_score,
          COUNT(DISTINCT r.id) as rubrics_count
        FROM lms_assignments a
        LEFT JOIN lms_courses c ON a.course_id = c.id
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN lms_submissions s ON a.id = s.assignment_id
        LEFT JOIN lms_rubrics r ON a.id = r.assignment_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 0;

      // Filter by course if specified
      if (courseId) {
        const canAccess = await canAccessCourse(session.user.id, courseId, 'read');
        if (!canAccess) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        paramCount++;
        query += ` AND a.course_id = $${paramCount}`;
        params.push(courseId);
      } else {
        // Filter to only courses user can access
        const canViewAll = await hasLMSPermission(session.user.id, 'assignments', 'read');
        if (!canViewAll && !['super_admin', 'admin'].includes(session.user.role_name)) {
          query += ` AND (
            c.id IN (
              SELECT DISTINCT course_id FROM lms_course_schedules WHERE instructor_id = $${paramCount + 1}
              UNION
              SELECT DISTINCT course_id FROM lms_course_enrollments WHERE student_id = $${paramCount + 1}
            )
          )`;
          paramCount++;
          params.push(session.user.id);
        }
      }

      // Search filter
      if (search) {
        paramCount++;
        query += ` AND (
          a.title ILIKE $${paramCount} OR 
          a.title_km ILIKE $${paramCount} OR 
          a.description ILIKE $${paramCount} OR
          c.title ILIKE $${paramCount} OR
          c.code ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      // Status filter
      if (status !== 'all') {
        paramCount++;
        query += ` AND a.is_published = $${paramCount}`;
        params.push(status === 'published');
      } else if (!['super_admin', 'admin', 'teacher'].includes(session.user.role_name)) {
        // Students only see published assignments
        query += ` AND a.is_published = true`;
      }

      // Type filter
      if (type !== 'all') {
        paramCount++;
        query += ` AND a.assignment_type = $${paramCount}`;
        params.push(type);
      }

      // Due date filter
      if (dueDateFilter === 'upcoming') {
        query += ` AND a.due_date > NOW() AND a.due_date <= NOW() + INTERVAL '7 days'`;
      } else if (dueDateFilter === 'overdue') {
        query += ` AND a.due_date < NOW()`;
      }

      query += ` GROUP BY a.id, c.title, c.code, u.name`;
      query += ` ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const assignmentsResult = await client.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT a.id) as total
        FROM lms_assignments a
        LEFT JOIN lms_courses c ON a.course_id = c.id
        WHERE 1=1
      `;

      const countParams: any[] = [];
      let countParamCount = 0;

      if (courseId) {
        countParamCount++;
        countQuery += ` AND a.course_id = $${countParamCount}`;
        countParams.push(courseId);
      } else {
        const canViewAll = await hasLMSPermission(session.user.id, 'assignments', 'read');
        if (!canViewAll && !['super_admin', 'admin'].includes(session.user.role_name)) {
          countQuery += ` AND (
            c.id IN (
              SELECT DISTINCT course_id FROM lms_course_schedules WHERE instructor_id = $${countParamCount + 1}
              UNION
              SELECT DISTINCT course_id FROM lms_course_enrollments WHERE student_id = $${countParamCount + 1}
            )
          )`;
          countParamCount++;
          countParams.push(session.user.id);
        }
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (
          a.title ILIKE $${countParamCount} OR 
          a.title_km ILIKE $${countParamCount} OR 
          a.description ILIKE $${countParamCount} OR
          c.title ILIKE $${countParamCount} OR
          c.code ILIKE $${countParamCount}
        )`;
        countParams.push(`%${search}%`);
      }

      if (status !== 'all') {
        countParamCount++;
        countQuery += ` AND a.is_published = $${countParamCount}`;
        countParams.push(status === 'published');
      } else if (!['super_admin', 'admin', 'teacher'].includes(session.user.role_name)) {
        countQuery += ` AND a.is_published = true`;
      }

      if (type !== 'all') {
        countParamCount++;
        countQuery += ` AND a.assignment_type = $${countParamCount}`;
        countParams.push(type);
      }

      if (dueDateFilter === 'upcoming') {
        countQuery += ` AND a.due_date > NOW() AND a.due_date <= NOW() + INTERVAL '7 days'`;
      } else if (dueDateFilter === 'overdue') {
        countQuery += ` AND a.due_date < NOW()`;
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      // Add student's submission status if student
      let assignmentsWithStatus = assignmentsResult.rows;
      if (session.user.role_name === 'student') {
        const assignmentIds = assignmentsResult.rows.map(a => a.id);
        if (assignmentIds.length > 0) {
          const submissionsQuery = `
            SELECT 
              assignment_id,
              status,
              score,
              submitted_at,
              is_late,
              graded_at
            FROM lms_submissions
            WHERE assignment_id = ANY($1) AND student_id = $2
          `;
          
          const submissionsResult = await client.query(submissionsQuery, [assignmentIds, session.user.id]);
          const submissionsMap = new Map(submissionsResult.rows.map(s => [s.assignment_id, s]));
          
          assignmentsWithStatus = assignmentsResult.rows.map(assignment => ({
            ...assignment,
            student_submission: submissionsMap.get(assignment.id) || null
          }));
        }
      }

      await logActivity(session.user.id, 'assignment', 'list', { page, search, courseId });

      return NextResponse.json({
        assignments: assignmentsWithStatus,
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
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
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

    const canCreate = await hasLMSPermission(session.user.id, 'assignments', 'create');
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      course_id,
      title,
      title_km,
      description,
      description_km,
      instructions,
      instructions_km,
      assignment_type,
      total_points,
      due_date,
      available_from,
      available_until,
      allow_late_submission,
      late_penalty_percent,
      is_published,
      rubric
    } = body;

    // Validate required fields
    if (!course_id || !title || !assignment_type) {
      return NextResponse.json(
        { error: 'course_id, title, and assignment_type are required' },
        { status: 400 }
      );
    }

    // Check if user can access the course
    const canAccess = await canAccessCourse(session.user.id, course_id, 'write');
    if (!canAccess) {
      return NextResponse.json({ error: 'Cannot access course' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create assignment
      const assignmentResult = await client.query(
        `INSERT INTO lms_assignments 
         (course_id, title, title_km, description, description_km, instructions, instructions_km,
          assignment_type, total_points, due_date, available_from, available_until,
          allow_late_submission, late_penalty_percent, created_by, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          course_id,
          title,
          title_km,
          description,
          description_km,
          instructions,
          instructions_km,
          assignment_type,
          total_points || 100,
          due_date,
          available_from,
          available_until,
          allow_late_submission !== false,
          late_penalty_percent || 10,
          session.user.id,
          is_published || false
        ]
      );

      const assignment = assignmentResult.rows[0];

      // Create rubric if provided
      if (rubric && rubric.criteria && Array.isArray(rubric.criteria)) {
        const rubricResult = await client.query(
          'INSERT INTO lms_rubrics (assignment_id, title) VALUES ($1, $2) RETURNING id',
          [assignment.id, rubric.title || 'Assignment Rubric']
        );

        const rubricId = rubricResult.rows[0].id;

        // Create rubric criteria
        for (let i = 0; i < rubric.criteria.length; i++) {
          const criterion = rubric.criteria[i];
          await client.query(
            `INSERT INTO lms_rubric_criteria 
             (rubric_id, criterion, description, max_points, order_index, bloom_level)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              rubricId,
              criterion.criterion,
              criterion.description,
              criterion.max_points,
              i + 1,
              criterion.bloom_level
            ]
          );
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'assignment',
        'create',
        { assignmentId: assignment.id, courseId: course_id, title },
        'assignments',
        assignment.id
      );

      return NextResponse.json({
        message: 'Assignment created successfully',
        assignment
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}