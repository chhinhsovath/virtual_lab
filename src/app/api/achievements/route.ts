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
    const student_id = searchParams.get('student_id') || session.user_id;
    const simulation_id = searchParams.get('simulation_id');

    const client = await pool.connect();
    
    try {
      let query, queryParams: any[];

      if (student_id) {
        // For now, return empty achievements due to UUID/integer mismatch
        return NextResponse.json({
          success: true,
          achievements: [],
          stats: {
            total_achievements: 0,
            total_points: 0,
            simulations_with_achievements: 0
          }
        });
      } else {
        // Get all available achievements
        query = `
          SELECT 
            sach.*,
            0 as times_earned,
            false as earned_by_user
          FROM simulation_achievements sach
          WHERE sach.is_active = true
          ORDER BY sach.points DESC, sach.name
        `;
        queryParams = [];
      }

      const result = await client.query(query, queryParams);

      // Return simple stats for now
      return NextResponse.json({
        success: true,
        achievements: result.rows,
        stats: {
          total_achievements: 0,
          total_points: 0,
          simulations_with_achievements: 0
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch achievements', details: error.message },
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
      name,
      description_en,
      description_km,
      achievement_type,
      criteria,
      points,
      badge_icon,
      badge_color
    } = body;

    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO simulation_achievements (
          name, description_en, description_km, achievement_type, criteria,
          points, badge_icon, badge_color
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        name, description_en, description_km, achievement_type, criteria,
        points, badge_icon, badge_color
      ]);

      return NextResponse.json({
        success: true,
        achievement: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}

// Award achievement to student
export async function PUT(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { student_id, achievement_id, simulation_id } = body;

    // Only allow teachers to award to any student, or students to earn their own
    if (session.user.role_name !== 'teacher' && student_id !== session.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if achievement exists and get points
      const achievementResult = await client.query(`
        SELECT id, points FROM simulation_achievements 
        WHERE id = $1 AND is_active = true
      `, [achievement_id]);

      if (achievementResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
      }

      const achievement = achievementResult.rows[0];

      // Check if student already has this achievement for this simulation
      const existingResult = await client.query(`
        SELECT id FROM student_achievements 
        WHERE student_id = $1 AND achievement_id = $2 AND simulation_id = $3
      `, [student_id, achievement_id, simulation_id]);

      if (existingResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Achievement already earned' }, { status: 400 });
      }

      // Award the achievement
      const result = await client.query(`
        INSERT INTO student_achievements (student_id, achievement_id, simulation_id, points_earned)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [student_id, achievement_id, simulation_id, achievement.points]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        achievement: result.rows[0],
        message: 'Achievement earned successfully!'
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return NextResponse.json(
      { error: 'Failed to award achievement' },
      { status: 500 }
    );
  }
}