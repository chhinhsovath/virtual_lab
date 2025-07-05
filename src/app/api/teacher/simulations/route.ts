import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        id,
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
        is_featured,
        is_active,
        created_at,
        updated_at
      FROM stem_simulations_catalog
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (subject) {
      query += ` AND subject_area = $${paramIndex}`;
      params.push(subject);
      paramIndex++;
    }

    if (search) {
      query += ` AND (
        LOWER(display_name_en) LIKE LOWER($${paramIndex}) OR
        LOWER(display_name_km) LIKE LOWER($${paramIndex}) OR
        LOWER(description_en) LIKE LOWER($${paramIndex}) OR
        LOWER(description_km) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.user.role !== 'teacher') {
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
      is_featured = false,
      is_active = true
    } = body;

    // Validate required fields
    if (!simulation_name || !display_name_en || !subject_area || !difficulty_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO stem_simulations_catalog (
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
          is_featured,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
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
          is_featured,
          is_active
        ]
      );

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