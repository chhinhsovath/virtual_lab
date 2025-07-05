import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Get overall statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_simulations,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_simulations,
          COUNT(*) FILTER (WHERE subject_area = 'Physics') as physics_count,
          COUNT(*) FILTER (WHERE subject_area = 'Chemistry') as chemistry_count,
          COUNT(*) FILTER (WHERE subject_area = 'Biology') as biology_count,
          COUNT(*) FILTER (WHERE subject_area = 'Mathematics') as mathematics_count,
          COUNT(*) FILTER (WHERE difficulty_level = 'Beginner') as beginner_count,
          COUNT(*) FILTER (WHERE difficulty_level = 'Intermediate') as intermediate_count,
          COUNT(*) FILTER (WHERE difficulty_level = 'Advanced') as advanced_count
        FROM stem_simulations_catalog 
        WHERE is_active = true
      `;

      const statsResult = await client.query(statsQuery);
      const stats = statsResult.rows[0];

      // Get usage statistics if available
      const usageQuery = `
        SELECT 
          sc.subject_area,
          COUNT(DISTINCT ssp.student_id) as unique_users,
          COUNT(ssp.id) as total_attempts,
          ROUND(AVG(ssp.best_score), 2) as average_score,
          ROUND(AVG(ssp.total_time_spent::DECIMAL / 60), 2) as avg_time_minutes
        FROM stem_simulations_catalog sc
        LEFT JOIN student_simulation_progress ssp ON sc.id = ssp.simulation_id
        WHERE sc.is_active = true
        GROUP BY sc.subject_area
        ORDER BY sc.subject_area
      `;

      const usageResult = await client.query(usageQuery);
      const usageStats = usageResult.rows;

      // Get most popular simulations
      const popularQuery = `
        SELECT 
          sc.simulation_name,
          sc.display_name_en,
          sc.display_name_km,
          sc.subject_area,
          COUNT(DISTINCT ssp.student_id) as total_users,
          COUNT(ssp.id) as total_attempts,
          ROUND(AVG(ssp.best_score), 2) as average_score
        FROM stem_simulations_catalog sc
        LEFT JOIN student_simulation_progress ssp ON sc.id = ssp.simulation_id
        WHERE sc.is_active = true
        GROUP BY sc.id, sc.simulation_name, sc.display_name_en, sc.display_name_km, sc.subject_area
        ORDER BY total_users DESC NULLS LAST, total_attempts DESC NULLS LAST
        LIMIT 5
      `;

      const popularResult = await client.query(popularQuery);
      const popularSimulations = popularResult.rows;

      return NextResponse.json({
        success: true,
        stats: {
          total_simulations: parseInt(stats.total_simulations),
          featured_simulations: parseInt(stats.featured_simulations),
          by_subject: {
            Physics: parseInt(stats.physics_count),
            Chemistry: parseInt(stats.chemistry_count),
            Biology: parseInt(stats.biology_count),
            Mathematics: parseInt(stats.mathematics_count)
          },
          by_difficulty: {
            Beginner: parseInt(stats.beginner_count),
            Intermediate: parseInt(stats.intermediate_count),
            Advanced: parseInt(stats.advanced_count)
          }
        },
        usage_stats: usageStats,
        popular_simulations: popularSimulations
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching simulation statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch simulation statistics'
      },
      { status: 500 }
    );
  }
}