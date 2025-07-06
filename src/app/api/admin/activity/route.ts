import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { withSuperAdmin } from '@/lib/super-admin-api';

export const GET = withSuperAdmin(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search');
  const action = searchParams.get('action');
  const status = searchParams.get('status');
  const range = searchParams.get('range') || '24h';
  const offset = (page - 1) * limit;

  const client = await pool.connect();
  
  try {
    let whereConditions = ['1=1'];
    const values: any[] = [];
    let valueIndex = 1;

    // Date range filter
    if (range !== 'all') {
      const intervals: Record<string, string> = {
        '1h': '1 hour',
        '24h': '24 hours',
        '7d': '7 days',
        '30d': '30 days'
      };
      if (intervals[range]) {
        whereConditions.push(`al.created_at > NOW() - INTERVAL '${intervals[range]}'`);
      }
    }

    // Search filter
    if (search) {
      whereConditions.push(`(
        u.full_name ILIKE $${valueIndex} OR 
        u.email ILIKE $${valueIndex} OR
        al.action ILIKE $${valueIndex} OR
        al.resource_type ILIKE $${valueIndex}
      )`);
      values.push(`%${search}%`);
      valueIndex++;
    }

    // Action filter
    if (action && action !== 'all') {
      const actionPatterns: Record<string, string> = {
        'auth': 'auth.%',
        'user': 'user.%',
        'school': 'school.%',
        'simulation': 'simulation.%',
        'api': 'api.%'
      };
      if (actionPatterns[action]) {
        whereConditions.push(`al.action LIKE $${valueIndex}`);
        values.push(actionPatterns[action]);
        valueIndex++;
      }
    }

    // Status filter
    if (status && status !== 'all') {
      whereConditions.push(`al.status = $${valueIndex}`);
      values.push(status);
      valueIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
    `;
    const countResult = await client.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get logs with pagination
    const logsQuery = `
      SELECT 
        al.*,
        u.full_name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;
    values.push(limit, offset);

    const logsResult = await client.query(logsQuery, values);

    return NextResponse.json({
      success: true,
      logs: logsResult.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
});