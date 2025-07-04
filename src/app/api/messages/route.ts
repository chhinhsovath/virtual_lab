import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '../../../lib/lms-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all'; // 'sent', 'received', 'all'
    const courseId = searchParams.get('course_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const offset = (page - 1) * limit;
    const client = await pool.connect();

    try {
      let query = `
        SELECT 
          m.*,
          sender.name as sender_name,
          sender.email as sender_email,
          recipient.name as recipient_name,
          recipient.email as recipient_email,
          c.title as course_title,
          c.code as course_code,
          COUNT(replies.id) as reply_count
        FROM lms_messages m
        LEFT JOIN users sender ON m.sender_id = sender.id
        LEFT JOIN users recipient ON m.recipient_id = recipient.id
        LEFT JOIN lms_courses c ON m.course_id = c.id
        LEFT JOIN lms_messages replies ON m.id = replies.parent_message_id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramCount = 0;

      // Filter by message type
      if (type === 'sent') {
        paramCount++;
        query += ` AND m.sender_id = $${paramCount}`;
        params.push(session.user.id);
      } else if (type === 'received') {
        paramCount++;
        query += ` AND m.recipient_id = $${paramCount}`;
        params.push(session.user.id);
      } else {
        // All messages (sent or received)
        paramCount++;
        query += ` AND (m.sender_id = $${paramCount} OR m.recipient_id = $${paramCount})`;
        params.push(session.user.id);
      }

      // Filter by course
      if (courseId) {
        paramCount++;
        query += ` AND m.course_id = $${paramCount}`;
        params.push(courseId);
      }

      // Filter unread messages
      if (unreadOnly && type !== 'sent') {
        query += ` AND m.is_read = false AND m.recipient_id = $1`;
      }

      // Only show top-level messages (not replies)
      query += ` AND m.parent_message_id IS NULL`;

      query += ` GROUP BY m.id, sender.name, sender.email, recipient.name, recipient.email, c.title, c.code`;
      query += ` ORDER BY m.created_at DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const messagesResult = await client.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM lms_messages m
        WHERE m.parent_message_id IS NULL
      `;

      const countParams: any[] = [];
      let countParamCount = 0;

      if (type === 'sent') {
        countParamCount++;
        countQuery += ` AND m.sender_id = $${countParamCount}`;
        countParams.push(session.user.id);
      } else if (type === 'received') {
        countParamCount++;
        countQuery += ` AND m.recipient_id = $${countParamCount}`;
        countParams.push(session.user.id);
      } else {
        countParamCount++;
        countQuery += ` AND (m.sender_id = $${countParamCount} OR m.recipient_id = $${countParamCount})`;
        countParams.push(session.user.id);
      }

      if (courseId) {
        countParamCount++;
        countQuery += ` AND m.course_id = $${countParamCount}`;
        countParams.push(courseId);
      }

      if (unreadOnly && type !== 'sent') {
        countQuery += ` AND m.is_read = false AND m.recipient_id = $1`;
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      // Get unread count for current user
      const unreadResult = await client.query(
        'SELECT COUNT(*) as unread FROM lms_messages WHERE recipient_id = $1 AND is_read = false',
        [session.user.id]
      );
      const unreadCount = parseInt(unreadResult.rows[0].unread);

      return NextResponse.json({
        messages: messagesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        unreadCount
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const body = await request.json();
    const { recipient_id, course_id, subject, body: messageBody, parent_message_id } = body;

    // Validate required fields
    if (!recipient_id || !messageBody) {
      return NextResponse.json(
        { error: 'recipient_id and body are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if recipient exists and user can message them
      const recipientResult = await client.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [recipient_id]
      );

      if (recipientResult.rows.length === 0) {
        return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
      }

      // If this is a course message, check if both users have access to the course
      if (course_id) {
        const courseAccessQuery = `
          SELECT COUNT(*) as access_count
          FROM (
            SELECT course_id FROM lms_course_enrollments WHERE student_id = $1 AND course_id = $3
            UNION
            SELECT course_id FROM lms_course_schedules WHERE instructor_id = $1 AND course_id = $3
            UNION
            SELECT course_id FROM lms_course_enrollments WHERE student_id = $2 AND course_id = $3
            UNION
            SELECT course_id FROM lms_course_schedules WHERE instructor_id = $2 AND course_id = $3
          ) as access
        `;

        const accessResult = await client.query(courseAccessQuery, [
          session.user.id,
          recipient_id,
          course_id
        ]);

        if (parseInt(accessResult.rows[0].access_count) < 2) {
          return NextResponse.json(
            { error: 'Both users must have access to the course' },
            { status: 403 }
          );
        }
      }

      // If this is a reply, verify the parent message exists and user has access
      if (parent_message_id) {
        const parentResult = await client.query(
          `SELECT id, sender_id, recipient_id FROM lms_messages 
           WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)`,
          [parent_message_id, session.user.id]
        );

        if (parentResult.rows.length === 0) {
          return NextResponse.json(
            { error: 'Parent message not found or access denied' },
            { status: 404 }
          );
        }
      }

      // Create message
      const messageResult = await client.query(
        `INSERT INTO lms_messages 
         (sender_id, recipient_id, course_id, subject, body, parent_message_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          session.user.id,
          recipient_id,
          course_id,
          subject,
          messageBody,
          parent_message_id
        ]
      );

      const message = messageResult.rows[0];

      await logActivity(
        session.user.id,
        'message',
        parent_message_id ? 'reply' : 'send',
        {
          messageId: message.id,
          recipientId: recipient_id,
          courseId: course_id,
          isReply: !!parent_message_id
        },
        'messages',
        message.id
      );

      return NextResponse.json({
        message: 'Message sent successfully',
        data: message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}