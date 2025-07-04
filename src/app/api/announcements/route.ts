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
    const type = searchParams.get('type') || 'all'; // 'system', 'course', 'general', 'all'
    const courseId = searchParams.get('course_id');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const activeOnly = searchParams.get('active_only') !== 'false';

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        SELECT 
          a.*,
          u.name as created_by_name,
          c.title as course_title,
          c.code as course_code
        FROM lms_announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN lms_courses c ON a.course_id = c.id
        WHERE a.is_published = true
      `;

      const params: any[] = [];
      let paramCount = 0;

      // Filter by active announcements
      if (activeOnly) {
        query += ` AND (a.expire_date IS NULL OR a.expire_date > NOW())`;
        query += ` AND a.publish_date <= NOW()`;
      }

      // Filter by type
      if (type !== 'all') {
        paramCount++;
        query += ` AND a.announcement_type = $${paramCount}`;
        params.push(type);
      }

      // Filter by course
      if (courseId) {
        // Check if user can access the course
        const canAccess = await canAccessCourse(session.user.id, courseId, 'read');
        if (!canAccess) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        paramCount++;
        query += ` AND a.course_id = $${paramCount}`;
        params.push(courseId);
      } else {
        // Filter announcements based on user's course access
        const canViewAll = await hasLMSPermission(session.user.id, 'announcements', 'read');
        if (!canViewAll) {
          // Show system/general announcements + course announcements for enrolled/teaching courses
          query += ` AND (
            a.announcement_type IN ('system', 'general')
            OR a.course_id IN (
              SELECT DISTINCT course_id FROM lms_course_schedules WHERE instructor_id = $${paramCount + 1}
              UNION
              SELECT DISTINCT course_id FROM lms_course_enrollments WHERE student_id = $${paramCount + 1}
            )
            OR a.course_id IS NULL
          )`;
          paramCount++;
          params.push(session.user.id);
        }
      }

      // Filter by priority
      if (priority) {
        paramCount++;
        query += ` AND a.priority = $${paramCount}`;
        params.push(priority);
      }

      query += ` ORDER BY a.priority DESC, a.publish_date DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const announcementsResult = await client.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM lms_announcements a
        LEFT JOIN lms_courses c ON a.course_id = c.id
        WHERE a.is_published = true
      `;

      const countParams: any[] = [];
      let countParamCount = 0;

      if (activeOnly) {
        countQuery += ` AND (a.expire_date IS NULL OR a.expire_date > NOW())`;
        countQuery += ` AND a.publish_date <= NOW()`;
      }

      if (type !== 'all') {
        countParamCount++;
        countQuery += ` AND a.announcement_type = $${countParamCount}`;
        countParams.push(type);
      }

      if (courseId) {
        countParamCount++;
        countQuery += ` AND a.course_id = $${countParamCount}`;
        countParams.push(courseId);
      } else {
        const canViewAll = await hasLMSPermission(session.user.id, 'announcements', 'read');
        if (!canViewAll) {
          countQuery += ` AND (
            a.announcement_type IN ('system', 'general')
            OR a.course_id IN (
              SELECT DISTINCT course_id FROM lms_course_schedules WHERE instructor_id = $${countParamCount + 1}
              UNION
              SELECT DISTINCT course_id FROM lms_course_enrollments WHERE student_id = $${countParamCount + 1}
            )
            OR a.course_id IS NULL
          )`;
          countParamCount++;
          countParams.push(session.user.id);
        }
      }

      if (priority) {
        countParamCount++;
        countQuery += ` AND a.priority = $${countParamCount}`;
        countParams.push(priority);
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      await logActivity(session.user.id, 'announcement', 'list', { page, type, courseId });

      return NextResponse.json({
        announcements: announcementsResult.rows,
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
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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

    const canCreate = await hasLMSPermission(session.user.id, 'announcements', 'create');
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      title_km,
      content,
      content_km,
      announcement_type,
      course_id,
      priority,
      publish_date,
      expire_date,
      is_published
    } = body;

    // Validate required fields
    if (!title || !content || !announcement_type) {
      return NextResponse.json(
        { error: 'title, content, and announcement_type are required' },
        { status: 400 }
      );
    }

    // Validate announcement type
    const validTypes = ['system', 'course', 'general'];
    if (!validTypes.includes(announcement_type)) {
      return NextResponse.json(
        { error: 'Invalid announcement_type' },
        { status: 400 }
      );
    }

    // If course announcement, check course access
    if (announcement_type === 'course') {
      if (!course_id) {
        return NextResponse.json(
          { error: 'course_id is required for course announcements' },
          { status: 400 }
        );
      }

      const canAccess = await canAccessCourse(session.user.id, course_id, 'write');
      if (!canAccess) {
        return NextResponse.json({ error: 'Cannot access course' }, { status: 403 });
      }
    }

    const client = await pool.connect();
    try {
      // Create announcement
      const announcementResult = await client.query(
        `INSERT INTO lms_announcements 
         (title, title_km, content, content_km, announcement_type, course_id, 
          priority, publish_date, expire_date, created_by, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          title,
          title_km,
          content,
          content_km,
          announcement_type,
          announcement_type === 'course' ? course_id : null,
          priority || 'normal',
          publish_date || new Date(),
          expire_date,
          session.user.id,
          is_published !== false
        ]
      );

      const announcement = announcementResult.rows[0];

      await logActivity(
        session.user.id,
        'announcement',
        'create',
        {
          announcementId: announcement.id,
          type: announcement_type,
          courseId: course_id,
          title
        },
        'announcements',
        announcement.id
      );

      return NextResponse.json({
        message: 'Announcement created successfully',
        announcement
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}