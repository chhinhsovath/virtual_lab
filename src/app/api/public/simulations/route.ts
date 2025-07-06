import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '6');
    const subject = searchParams.get('subject');

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          s.id,
          s.simulation_name,
          s.display_name_en,
          s.display_name_km,
          s.description_en,
          s.description_km,
          s.subject_area,
          s.difficulty_level,
          s.grade_levels,
          s.estimated_duration,
          s.simulation_url,
          s.preview_image,
          s.tags,
          s.is_featured,
          s.learning_objectives_en,
          s.learning_objectives_km
        FROM stem_simulations_catalog s
        WHERE s.is_active = true
      `;

      const params: any[] = [];
      let paramCount = 0;

      if (featured) {
        query += ` AND s.is_featured = true`;
      }

      if (subject && subject !== 'all') {
        paramCount++;
        query += ` AND s.subject_area = $${paramCount}`;
        params.push(subject);
      }

      // Order by featured first, then by newest
      query += ` ORDER BY s.is_featured DESC, s.created_at DESC`;

      // Add limit
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      const result = await client.query(query, params);

      // Get statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_featured = true) as featured_count,
          COUNT(*) FILTER (WHERE subject_area = 'Physics') as physics_count,
          COUNT(*) FILTER (WHERE subject_area = 'Chemistry') as chemistry_count,
          COUNT(*) FILTER (WHERE subject_area = 'Biology') as biology_count,
          COUNT(*) FILTER (WHERE subject_area = 'Mathematics') as mathematics_count
        FROM stem_simulations_catalog
        WHERE is_active = true
      `;
      
      const statsResult = await client.query(statsQuery);
      const stats = statsResult.rows[0];

      return NextResponse.json({
        success: true,
        simulations: result.rows,
        stats: {
          total: parseInt(stats.total),
          featured: parseInt(stats.featured_count),
          by_subject: {
            Physics: parseInt(stats.physics_count),
            Chemistry: parseInt(stats.chemistry_count),
            Biology: parseInt(stats.biology_count),
            Mathematics: parseInt(stats.mathematics_count)
          }
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching public simulations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch simulations' 
    }, { status: 500 });
  }
}