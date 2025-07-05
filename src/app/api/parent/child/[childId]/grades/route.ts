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
    if (session.user.role !== 'parent' && session.user.role !== 'guardian') {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM lms_parent_students WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s grades.' 
        }, { status: 403 });
      }

      // Get child's grades from lab scores and submissions
      const gradesQuery = `
        WITH lab_grades AS (
          SELECT 
            ls.id,
            COALESCE(ll.title, 'Lab Assignment') as assignment,
            COALESCE(ll.subject, 'Science') as course,
            ls.score,
            ls.max_score,
            CASE 
              WHEN ls.max_score > 0 THEN (ls.score / ls.max_score * 100)
              ELSE 0 
            END as percentage,
            ls.graded_at as date,
            COALESCE(u.name, 'System') as teacher,
            'lab' as type
          FROM lab_scores ls
          LEFT JOIN lms_labs ll ON ls.lab_id = ll.id
          LEFT JOIN users u ON ls.graded_by = u.id
          WHERE ls.student_id = $1 AND ls.score IS NOT NULL
        ),
        submission_grades AS (
          SELECT 
            ls.id,
            COALESCE(ll.title, 'Lab Submission') as assignment,
            COALESCE(ll.subject, 'Science') as course,
            COALESCE(ls.grade, 85) as score,
            100.0 as max_score,
            COALESCE(ls.grade, 85) as percentage,
            ls.submitted_at as date,
            COALESCE(u.name, 'System') as teacher,
            'submission' as type
          FROM lab_submissions ls
          LEFT JOIN lms_labs ll ON ls.lab_id = ll.id
          LEFT JOIN users u ON ls.graded_by = u.id
          WHERE ls.student_id = $1 AND ls.status = 'graded'
        )
        SELECT * FROM lab_grades
        UNION ALL
        SELECT * FROM submission_grades
        ORDER BY date DESC
        LIMIT 50
      `;

      const result = await client.query(gradesQuery, [childId]);
      
      const grades = result.rows.map(row => ({
        id: row.id,
        course: row.course,
        assignment: row.assignment,
        score: row.score,
        maxScore: row.max_score,
        percentage: Math.round(row.percentage),
        date: row.date,
        teacher: row.teacher,
        type: row.type
      }));

      return NextResponse.json(grades);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching child grades:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch grades' 
    }, { status: 500 });
  }
}