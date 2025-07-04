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
    const includeDrafts = searchParams.get('include_drafts') === 'true';

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        SELECT 
          l.*,
          c.title as course_title,
          c.code as course_code,
          u.name as created_by_name,
          COUNT(DISTINCT lr.id) as resources_count,
          COUNT(DISTINCT sla.student_id) as students_attempted,
          AVG(sla.score) as average_score,
          COUNT(DISTINCT lv.id) as versions_count
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        LEFT JOIN users u ON l.created_by = u.id
        LEFT JOIN lms_lab_resources lr ON l.id = lr.lab_id
        LEFT JOIN lms_student_lab_activities sla ON l.id = sla.lab_id AND sla.status = 'submitted'
        LEFT JOIN lms_lab_versions lv ON l.id = lv.lab_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 0;

      // Filter by course if specified
      if (courseId) {
        // Check if user can access the course
        const canAccess = await canAccessCourse(session.user.id, courseId, 'read');
        if (!canAccess) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        paramCount++;
        query += ` AND l.course_id = $${paramCount}`;
        params.push(courseId);
      } else {
        // If no course specified, filter to only courses user can access
        const canViewAll = await hasLMSPermission(session.user.id, 'labs', 'read');
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
          l.title ILIKE $${paramCount} OR 
          l.title_km ILIKE $${paramCount} OR 
          l.description ILIKE $${paramCount} OR
          c.title ILIKE $${paramCount} OR
          c.code ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
      }

      // Status filter
      if (status !== 'all') {
        paramCount++;
        query += ` AND l.is_published = $${paramCount}`;
        params.push(status === 'published');
      } else if (!includeDrafts && !['super_admin', 'admin', 'teacher'].includes(session.user.role_name)) {
        // Students and parents only see published labs by default
        query += ` AND l.is_published = true`;
      }

      query += ` GROUP BY l.id, c.title, c.code, u.name`;
      query += ` ORDER BY l.created_at DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const labsResult = await client.query(query, params);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(DISTINCT l.id) as total
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        WHERE 1=1
      `;

      const countParams: any[] = [];
      let countParamCount = 0;

      if (courseId) {
        countParamCount++;
        countQuery += ` AND l.course_id = $${countParamCount}`;
        countParams.push(courseId);
      } else {
        const canViewAll = await hasLMSPermission(session.user.id, 'labs', 'read');
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
          l.title ILIKE $${countParamCount} OR 
          l.title_km ILIKE $${countParamCount} OR 
          l.description ILIKE $${countParamCount} OR
          c.title ILIKE $${countParamCount} OR
          c.code ILIKE $${countParamCount}
        )`;
        countParams.push(`%${search}%`);
      }

      if (status !== 'all') {
        countParamCount++;
        countQuery += ` AND l.is_published = $${countParamCount}`;
        countParams.push(status === 'published');
      } else if (!includeDrafts && !['super_admin', 'admin', 'teacher'].includes(session.user.role_name)) {
        countQuery += ` AND l.is_published = true`;
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      await logActivity(session.user.id, 'lab', 'list', { page, search, courseId });

      return NextResponse.json({
        labs: labsResult.rows,
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
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labs' },
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

    const canCreate = await hasLMSPermission(session.user.id, 'labs', 'create');
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
      grade,
      subject,
      simulation_url,
      duration_minutes,
      max_attempts,
      version_note,
      is_published,
      resources
    } = body;

    // Validate required fields
    if (!course_id || !title) {
      return NextResponse.json(
        { error: 'course_id and title are required' },
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

      // Create lab
      const labResult = await client.query(
        `INSERT INTO lms_labs 
         (course_id, title, title_km, description, description_km, grade, subject,
          simulation_url, duration_minutes, max_attempts, version_note, created_by, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          course_id,
          title,
          title_km,
          description,
          description_km,
          grade,
          subject,
          simulation_url,
          duration_minutes,
          max_attempts || 3,
          version_note,
          session.user.id,
          is_published || false
        ]
      );

      const lab = labResult.rows[0];

      // Create initial version
      await client.query(
        `INSERT INTO lms_lab_versions 
         (lab_id, version, change_description, created_by, lab_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          lab.id,
          '1.0',
          'Initial version',
          session.user.id,
          JSON.stringify({
            title,
            title_km,
            description,
            description_km,
            simulation_url,
            duration_minutes,
            max_attempts
          })
        ]
      );

      // Add resources if provided
      if (resources && Array.isArray(resources)) {
        for (const resource of resources) {
          await client.query(
            `INSERT INTO lms_lab_resources 
             (lab_id, resource_type, title, file_url, file_size, mime_type, version, uploaded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              lab.id,
              resource.resource_type,
              resource.title,
              resource.file_url,
              resource.file_size,
              resource.mime_type,
              resource.version || '1.0',
              session.user.id
            ]
          );
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab',
        'create',
        { labId: lab.id, courseId: course_id, title },
        'labs',
        lab.id
      );

      return NextResponse.json({
        message: 'Lab created successfully',
        lab
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: 'Failed to create lab' },
      { status: 500 }
    );
  }
}