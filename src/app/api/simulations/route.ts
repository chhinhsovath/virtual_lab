import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const client = await pool.connect();
    
    try {
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
        WHERE is_active = true
      `;
      
      const params: any[] = [];
      let paramCount = 0;

      if (subject && subject !== 'All') {
        paramCount++;
        query += ` AND subject_area = $${paramCount}`;
        params.push(subject);
      }

      if (difficulty) {
        paramCount++;
        query += ` AND difficulty_level = $${paramCount}`;
        params.push(difficulty);
      }

      if (featured === 'true') {
        query += ` AND is_featured = true`;
      }

      if (search) {
        paramCount++;
        query += ` AND (
          display_name_en ILIKE $${paramCount} OR 
          display_name_km ILIKE $${paramCount} OR 
          description_en ILIKE $${paramCount} OR
          tags && ARRAY[$${paramCount}]
        )`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY is_featured DESC, display_name_en ASC`;

      const result = await client.query(query, params);
      
      return NextResponse.json({
        success: true,
        simulations: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch simulations',
        simulations: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      is_featured = false
    } = body;

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO stem_simulations_catalog (
          simulation_name, display_name_en, display_name_km, description_en, description_km,
          subject_area, difficulty_level, grade_levels, estimated_duration,
          learning_objectives_en, learning_objectives_km, simulation_url, preview_image,
          tags, is_featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const values = [
        simulation_name, display_name_en, display_name_km, description_en, description_km,
        subject_area, difficulty_level, grade_levels, estimated_duration,
        learning_objectives_en, learning_objectives_km, simulation_url, preview_image,
        tags, is_featured
      ];

      const result = await client.query(query, values);
      
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
      { 
        success: false, 
        error: 'Failed to create simulation'
      },
      { status: 500 }
    );
  }
}