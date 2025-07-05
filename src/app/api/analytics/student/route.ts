import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const student_id = parseInt(searchParams.get('student_id') || session.user_id.toString());
    const timeframe = searchParams.get('timeframe') || '30'; // days

    // Only allow teachers to view other students' analytics
    if (session.user.role_name !== 'teacher' && student_id !== session.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Overall statistics
      const overallStatsQuery = `
        SELECT 
          COUNT(DISTINCT ssp.simulation_id) as simulations_attempted,
          COUNT(CASE WHEN ssp.completed_at IS NOT NULL THEN 1 END) as simulations_completed,
          COALESCE(SUM(ssp.total_time_spent), 0) as total_time_minutes,
          COALESCE(AVG(ssp.best_score), 0) as average_score,
          0 as achievements_earned,
          0 as total_points
        FROM student_simulation_progress ssp
        WHERE ssp.student_id = $1
        AND ssp.started_at >= NOW() - ($2::integer * INTERVAL '1 day')
      `;

      const overallStats = await client.query(overallStatsQuery, [student_id, parseInt(timeframe)]);

      // Subject-wise performance
      const subjectStatsQuery = `
        SELECT 
          s.subject_area,
          COUNT(DISTINCT ssp.simulation_id) as simulations_attempted,
          COUNT(CASE WHEN ssp.completed_at IS NOT NULL THEN 1 END) as simulations_completed,
          COALESCE(AVG(ssp.best_score), 0) as average_score,
          COALESCE(SUM(ssp.total_time_spent), 0) as total_time_minutes
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog s ON ssp.simulation_id = s.id
        WHERE ssp.student_id = $1
        AND ssp.started_at >= NOW() - ($2::integer * INTERVAL '1 day')
        GROUP BY s.subject_area
        ORDER BY average_score DESC
      `;

      const subjectStats = await client.query(subjectStatsQuery, [student_id, parseInt(timeframe)]);

      // Recent activity
      const recentActivityQuery = `
        SELECT 
          ssp.*,
          s.simulation_name,
          s.display_name_en,
          s.display_name_km,
          s.subject_area,
          s.difficulty_level,
          CASE 
            WHEN ssp.completed_at IS NOT NULL THEN 'completed'
            WHEN ssp.current_progress IS NOT NULL THEN 'in_progress'
            ELSE 'started'
          END as status,
          ROUND(
            CASE 
              WHEN ssp.completed_at IS NOT NULL THEN 100
              WHEN ssp.current_progress IS NOT NULL THEN 
                COALESCE((ssp.current_progress->>'percentage')::numeric, 0)
              ELSE 0
            END
          ) as progress_percentage
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog s ON ssp.simulation_id = s.id
        WHERE ssp.student_id = $1
        ORDER BY ssp.updated_at DESC
        LIMIT 10
      `;

      const recentActivity = await client.query(recentActivityQuery, [student_id]);

      // Learning streaks and patterns
      const learningPatternsQuery = `
        SELECT 
          DATE(ssp.started_at) as activity_date,
          COUNT(*) as sessions_count,
          SUM(ssp.total_time_spent) as daily_time_minutes,
          AVG(ssp.best_score) as daily_average_score
        FROM student_simulation_progress ssp
        WHERE ssp.student_id = $1
        AND ssp.started_at >= NOW() - ($2::integer * INTERVAL '1 day')
        GROUP BY DATE(ssp.started_at)
        ORDER BY activity_date DESC
      `;

      const learningPatterns = await client.query(learningPatternsQuery, [student_id, parseInt(timeframe)]);

      // Achievement progress - skipping for now due to UUID/integer mismatch
      const achievementProgress = { rows: [] };

      // Performance comparison (percentile ranking)
      const performanceComparisonQuery = `
        WITH student_avg AS (
          SELECT AVG(best_score) as student_average
          FROM student_simulation_progress 
          WHERE student_id = $1 AND completed_at IS NOT NULL
        ),
        all_students_avg AS (
          SELECT 
            student_id,
            AVG(best_score) as student_average
          FROM student_simulation_progress 
          WHERE completed_at IS NOT NULL
          GROUP BY student_id
        )
        SELECT 
          sa.student_average,
          COUNT(asa.student_id) as total_students,
          COUNT(CASE WHEN asa.student_average < sa.student_average THEN 1 END) as students_below,
          ROUND(
            (COUNT(CASE WHEN asa.student_average < sa.student_average THEN 1 END) * 100.0 / 
             COUNT(asa.student_id)), 2
          ) as percentile_rank
        FROM student_avg sa
        CROSS JOIN all_students_avg asa
        GROUP BY sa.student_average
      `;

      const performanceComparison = await client.query(performanceComparisonQuery, [student_id]);

      return NextResponse.json({
        success: true,
        analytics: {
          overall_stats: overallStats.rows[0],
          subject_performance: subjectStats.rows,
          recent_activity: recentActivity.rows,
          learning_patterns: learningPatterns.rows,
          recent_achievements: achievementProgress.rows,
          performance_comparison: performanceComparison.rows[0] || null,
          timeframe: timeframe
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching student analytics:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch student analytics', details: error.message },
      { status: 500 }
    );
  }
}