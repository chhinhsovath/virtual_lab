import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has student role
    if (!session.user.roles?.includes('student')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Get student's simulation progress
      const progressQuery = `
        SELECT 
          ssp.*,
          ssc.simulation_name,
          ssc.display_name_en,
          ssc.display_name_km,
          ssc.subject_area,
          ssc.difficulty_level,
          ssc.estimated_duration,
          ssc.simulation_url
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog ssc ON ssp.simulation_id = ssc.id
        WHERE ssp.student_id = $1
        ORDER BY ssp.last_accessed DESC
      `;
      
      const progressResult = await client.query(progressQuery, [session.user.id]);
      
      // Get assignments
      const assignmentsQuery = `
        SELECT 
          sa.*,
          ssc.simulation_name,
          ssc.display_name_en as simulation_display_name
        FROM student_assignments sa
        JOIN stem_simulations_catalog ssc ON sa.simulation_id = ssc.id
        WHERE sa.student_id = $1
        ORDER BY sa.due_date ASC
      `;
      
      const assignmentsResult = await client.query(assignmentsQuery, [session.user.id]);
      
      // Get achievements
      const achievementsQuery = `
        SELECT * FROM student_achievements 
        WHERE student_id = $1
        ORDER BY unlocked_at DESC
      `;
      
      const achievementsResult = await client.query(achievementsQuery, [session.user.id]);

      return NextResponse.json({
        success: true,
        data: {
          simulations: progressResult.rows,
          assignments: assignmentsResult.rows,
          achievements: achievementsResult.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Student progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.roles?.includes('student')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { simulation_id, progress_percentage, time_spent, score } = await request.json();

    const client = await pool.connect();
    try {
      // Update or insert progress
      const upsertQuery = `
        INSERT INTO student_simulation_progress (
          student_id, simulation_id, progress_percentage, time_spent, 
          best_score, attempts, last_accessed
        ) VALUES ($1, $2, $3, $4, $5, 1, NOW())
        ON CONFLICT (student_id, simulation_id) 
        DO UPDATE SET 
          progress_percentage = GREATEST(student_simulation_progress.progress_percentage, $3),
          time_spent = student_simulation_progress.time_spent + $4,
          best_score = GREATEST(student_simulation_progress.best_score, $5),
          attempts = student_simulation_progress.attempts + 1,
          last_accessed = NOW(),
          completed = CASE WHEN $3 >= 100 THEN true ELSE student_simulation_progress.completed END
      `;

      await client.query(upsertQuery, [
        session.user.id,
        simulation_id,
        progress_percentage,
        time_spent,
        score
      ]);

      return NextResponse.json({ success: true });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}