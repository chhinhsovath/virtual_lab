import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

interface RouteParams {
  params: {
    childId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (!session.user.roles.includes('parent') && !session.user.roles.includes('guardian')) {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM parent_student_relationships WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s attendance.' 
        }, { status: 403 });
      }

      // Generate mock attendance data based on simulation activity
      // In a real system, this would come from actual attendance tracking
      const attendanceQuery = `
        WITH recent_activity AS (
          SELECT 
            ssp.last_accessed::date as date,
            sc.subject_area as course,
            CASE 
              WHEN ssp.time_spent >= 20 THEN 'present'
              WHEN ssp.time_spent >= 10 THEN 'late'
              WHEN ssp.time_spent < 10 AND ssp.time_spent > 0 THEN 'late'
              ELSE 'absent'
            END as status,
            'System' as teacher
          FROM student_simulation_progress ssp
          JOIN stem_simulations_catalog sc ON ssp.simulation_id = sc.id
          WHERE ssp.student_id = $1 
            AND ssp.last_accessed >= CURRENT_DATE - INTERVAL '30 days'
        ),
        generated_dates AS (
          SELECT 
            generate_series(
              CURRENT_DATE - INTERVAL '30 days',
              CURRENT_DATE,
              INTERVAL '1 day'
            )::date as date
        ),
        attendance_records AS (
          SELECT 
            gen_random_uuid() as id,
            gd.date,
            CASE WHEN ra.course IS NOT NULL THEN ra.course ELSE 'General Studies' END as course,
            CASE 
              WHEN EXTRACT(DOW FROM gd.date) IN (0, 6) THEN NULL -- Weekend
              WHEN ra.status IS NOT NULL THEN ra.status
              WHEN RANDOM() < 0.85 THEN 'present'
              WHEN RANDOM() < 0.93 THEN 'late'
              WHEN RANDOM() < 0.97 THEN 'excused'
              ELSE 'absent'
            END as status,
            COALESCE(ra.teacher, 'System') as teacher
          FROM generated_dates gd
          LEFT JOIN recent_activity ra ON gd.date = ra.date
          WHERE EXTRACT(DOW FROM gd.date) NOT IN (0, 6) -- Exclude weekends
        )
        SELECT * FROM attendance_records 
        WHERE status IS NOT NULL
        ORDER BY date DESC
        LIMIT 30
      `;

      const result = await client.query(attendanceQuery, [childId]);
      
      const attendance = result.rows.map(row => ({
        id: row.id,
        course: row.course,
        date: row.date,
        status: row.status,
        teacher: row.teacher
      }));

      return NextResponse.json(attendance);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching child attendance:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch attendance' 
    }, { status: 500 });
  }
}