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
          error: 'Access denied. You do not have permission to view this child\'s grades.' 
        }, { status: 403 });
      }

      // Get child's grades from simulation progress and assignments
      const gradesQuery = `
        WITH simulation_grades AS (
          SELECT 
            ssp.id,
            sc.display_name_en as assignment,
            sc.subject_area as course,
            ssp.best_score as score,
            10.0 as max_score,
            (ssp.best_score * 10) as percentage,
            ssp.last_accessed as date,
            'System' as teacher,
            'simulation' as type
          FROM student_simulation_progress ssp
          JOIN stem_simulations_catalog sc ON ssp.simulation_id = sc.id
          WHERE ssp.student_id = $1 AND ssp.best_score > 0
        ),
        assignment_grades AS (
          SELECT 
            sa.id,
            sa.title as assignment,
            sc.subject_area as course,
            sa.score,
            sa.max_score,
            CASE 
              WHEN sa.max_score > 0 THEN (sa.score / sa.max_score * 100)
              ELSE 0 
            END as percentage,
            sa.updated_at as date,
            COALESCE(u.name, 'System') as teacher,
            'assignment' as type
          FROM student_assignments sa
          JOIN stem_simulations_catalog sc ON sa.simulation_id = sc.id
          LEFT JOIN users u ON sa.teacher_id = u.id
          WHERE sa.student_id = $1 AND sa.score IS NOT NULL
        )
        SELECT * FROM simulation_grades
        UNION ALL
        SELECT * FROM assignment_grades
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