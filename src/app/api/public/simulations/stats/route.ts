import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
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

      return NextResponse.json({
        success: true,
        stats: {
          total: parseInt(stats.total),
          featured: parseInt(stats.featured_count),
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
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching simulation stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    }, { status: 500 });
  }
}