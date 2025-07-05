import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const grade = searchParams.get('grade');
    const featured = searchParams.get('featured');
    
    let session = await getAPISession(request);
    
    // Allow unauthenticated access for featured simulations only
    if (!session && featured !== 'true') {
      // In development, use mock session if no real session exists
      if (process.env.NODE_ENV === 'development') {
        session = createMockStudentSession();
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const client = await pool.connect();
    
    try {
      let query: string;
      let queryParams: any[] = [];
      let paramIndex = 1;

      if (session) {
        query = `
          SELECT 
            s.*,
            COALESCE(
              (SELECT AVG(ssp.best_score) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
              ), 0
            ) as user_average_score,
            COALESCE(
              (SELECT COUNT(*) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
              ), 0
            ) as user_attempts,
            COALESCE(
              (SELECT MAX(ssp.total_time_spent) 
               FROM student_simulation_progress ssp 
               WHERE ssp.simulation_id = s.id AND ssp.student_id = $1
              ), 0
            ) as user_total_time,
            (SELECT COUNT(*) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.completed_at IS NOT NULL
            ) as total_completions
          FROM stem_simulations_catalog s
          WHERE s.is_active = true
        `;
        queryParams = [session.user_id];
        paramIndex = 2;
      } else {
        // For unauthenticated requests (featured simulations on home page)
        query = `
          SELECT 
            s.*,
            0 as user_average_score,
            0 as user_attempts,
            0 as user_total_time,
            (SELECT COUNT(*) 
             FROM student_simulation_progress ssp 
             WHERE ssp.simulation_id = s.id AND ssp.completed_at IS NOT NULL
            ) as total_completions
          FROM stem_simulations_catalog s
          WHERE s.is_active = true
        `;
      }

      if (subject) {
        query += ` AND s.subject_area = $${paramIndex}`;
        queryParams.push(subject);
        paramIndex++;
      }

      if (difficulty) {
        query += ` AND s.difficulty_level = $${paramIndex}`;
        queryParams.push(difficulty);
        paramIndex++;
      }

      if (grade) {
        query += ` AND $${paramIndex} = ANY(s.grade_levels)`;
        queryParams.push(parseInt(grade));
        paramIndex++;
      }

      if (featured === 'true') {
        query += ` AND s.is_featured = true`;
      }

      query += ` ORDER BY s.is_featured DESC, s.created_at DESC`;

      const result = await client.query(query, queryParams);
      
      return NextResponse.json({
        success: true,
        simulations: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAPISession(request);
    if (!session || session.user.role_name !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      simulation_name,
      display_name_en,
      display_name_km,
      description_en,
      description_km,
      subject_area,
      difficulty_level,
      grade_levels,
      estimated_duration,
      learning_objectives_en,
      learning_objectives_km,
      simulation_url,
      preview_image,
      tags,
      is_featured
    } = body;

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO stem_simulations_catalog (
          simulation_name, display_name_en, display_name_km, description_en, description_km,
          subject_area, difficulty_level, grade_levels, estimated_duration,
          learning_objectives_en, learning_objectives_km, simulation_url, preview_image, tags, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        simulation_name, display_name_en, display_name_km, description_en, description_km,
        subject_area, difficulty_level, grade_levels, estimated_duration,
        learning_objectives_en, learning_objectives_km, simulation_url, preview_image, tags, is_featured
      ]);

      return NextResponse.json({
        success: true,
        simulation: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}