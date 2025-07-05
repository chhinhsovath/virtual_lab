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
      // Get comprehensive student statistics
      const statsQuery = `
        WITH student_progress AS (
          SELECT 
            ssp.*,
            ssc.subject_area
          FROM student_simulation_progress ssp
          JOIN stem_simulations_catalog ssc ON ssp.simulation_id = ssc.id
          WHERE ssp.student_id = $1
        ),
        subject_stats AS (
          SELECT 
            subject_area,
            COUNT(*) as total_simulations,
            COUNT(CASE WHEN completed THEN 1 END) as completed_simulations,
            AVG(best_score) as avg_score,
            SUM(time_spent) as total_time
          FROM student_progress
          GROUP BY subject_area
        )
        SELECT 
          -- Overall stats
          COUNT(sp.*) as total_simulations,
          COUNT(CASE WHEN sp.completed THEN 1 END) as completed_simulations,
          COALESCE(AVG(sp.best_score), 0) as average_score,
          COALESCE(SUM(sp.time_spent), 0) as total_time,
          
          -- Subject breakdown
          json_object_agg(
            COALESCE(ss.subject_area, 'Unknown'),
            json_build_object(
              'total', COALESCE(ss.total_simulations, 0),
              'completed', COALESCE(ss.completed_simulations, 0),
              'avg_score', COALESCE(ss.avg_score, 0),
              'total_time', COALESCE(ss.total_time, 0)
            )
          ) as by_subject
        FROM student_progress sp
        FULL OUTER JOIN subject_stats ss ON sp.subject_area = ss.subject_area
      `;
      
      const statsResult = await client.query(statsQuery, [session.user.id]);
      
      // Get achievements count and total points
      const achievementsQuery = `
        SELECT 
          COUNT(*) as total_achievements,
          COALESCE(SUM(points), 0) as total_points
        FROM student_achievements 
        WHERE student_id = $1
      `;
      
      const achievementsResult = await client.query(achievementsQuery, [session.user.id]);
      
      // Get recent activity
      const recentQuery = `
        SELECT 
          ssp.simulation_id,
          ssc.display_name_en,
          ssc.display_name_km,
          ssc.subject_area,
          ssp.progress_percentage,
          ssp.last_accessed
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog ssc ON ssp.simulation_id = ssc.id
        WHERE ssp.student_id = $1
        ORDER BY ssp.last_accessed DESC
        LIMIT 5
      `;
      
      const recentResult = await client.query(recentQuery, [session.user.id]);

      const stats = statsResult.rows[0] || {};
      const achievements = achievementsResult.rows[0] || {};

      return NextResponse.json({
        success: true,
        stats: {
          total_simulations: parseInt(stats.total_simulations) || 0,
          completed_simulations: parseInt(stats.completed_simulations) || 0,
          average_score: parseFloat(stats.average_score) || 0,
          total_time: parseInt(stats.total_time) || 0,
          total_achievements: parseInt(achievements.total_achievements) || 0,
          total_points: parseInt(achievements.total_points) || 0,
          by_subject: stats.by_subject || {
            'Physics': { total: 0, completed: 0, avg_score: 0, total_time: 0 },
            'Chemistry': { total: 0, completed: 0, avg_score: 0, total_time: 0 },
            'Biology': { total: 0, completed: 0, avg_score: 0, total_time: 0 },
            'Mathematics': { total: 0, completed: 0, avg_score: 0, total_time: 0 }
          },
          recent_activity: recentResult.rows
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Student stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student statistics' },
      { status: 500 }
    );
  }
}