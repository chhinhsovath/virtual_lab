import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          s.id,
          s.simulation_name,
          s.display_name_en AS title,
          s.display_name_km AS title_km,
          s.description_en AS description,
          s.description_km AS description_km,
          s.subject_area AS subject,
          s.difficulty_level AS difficulty,
          s.grade_levels,
          s.estimated_duration,
          s.is_active AS active,
          s.is_featured,
          s.simulation_url,
          -- s.simulation_file_path,
          s.preview_image,
          s.tags,
          -- s.status,
          -- s.exercise_content_en,
          -- s.exercise_content_km,
          -- s.instruction_content_en,
          -- s.instruction_content_km,
          s.created_at,
          s.updated_at,
          -- Get assignment count for this teacher
          COUNT(DISTINCT ta.id) AS assignment_count,
          -- Get student count from assignments
          COUNT(DISTINCT sp.student_id) AS students_assigned,
          -- Calculate average completion rate based on completed simulations
          COALESCE(AVG(CASE WHEN sp.completed_at IS NOT NULL THEN 100 ELSE 0 END), 0) AS completion_rate
        FROM stem_simulations_catalog s
        LEFT JOIN teacher_simulation_assignments ta 
          ON s.id = ta.simulation_id 
          ${session.user.teacherId ? 'AND ta.teacher_id = $1' : ''}
          AND ta.is_active = true
        LEFT JOIN student_simulation_progress sp 
          ON ta.id = sp.assignment_id
        WHERE 1=1
          ${!includeInactive ? 'AND s.is_active = true' : ''}
      `;

      const params: any[] = [];
      let paramCount = 0;
      
      // Only filter by teacher if teacherId exists
      if (session.user.teacherId) {
        params.push(session.user.teacherId);
        paramCount = 1;
      }

      // Add filters
      if (subject && subject !== 'all') {
        paramCount++;
        query += ` AND s.subject_area = $${paramCount}`;
        params.push(subject);
      }

      if (status && status !== 'all') {
        paramCount++;
        if (status === 'active') {
          query += ` AND s.is_active = true AND s.status = 'published'`;
        } else if (status === 'draft') {
          query += ` AND s.is_active = false`;
        } else if (status === 'review') {
          query += ` AND s.is_active = false`;
        } else if (status === 'published') {
          query += ` AND s.is_active = true`;
        }
      }

      if (search) {
        paramCount++;
        query += ` AND (LOWER(s.display_name_en) LIKE LOWER($${paramCount}) OR LOWER(s.display_name_km) LIKE LOWER($${paramCount}))`;
        params.push(`%${search}%`);
      }

      query += `
        GROUP BY s.id
        ORDER BY s.updated_at DESC
      `;

      const result = await client.query(query, params);

      // Transform the data to match the frontend expectations
      const modules = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        titleKm: row.title_km,
        description: row.description,
        descriptionKm: row.description_km,
        subject: row.subject,
        type: 'simulation', // All entries from this table are simulations
        status: row.active ? 'active' : 'inactive',
        studentsAssigned: parseInt(row.students_assigned) || 0,
        completionRate: parseFloat(row.completion_rate) || 0,
        lastModified: new Date(row.updated_at).toLocaleString(),
        difficulty: row.difficulty,
        estimatedDuration: row.estimated_duration,
        simulationUrl: row.simulation_url,
        simulationFilePath: row.simulation_url,
        previewImage: row.preview_image,
        tags: row.tags || [],
        isFeatured: row.is_featured,
        gradeLevels: row.grade_levels,
        exerciseContentEn: null,
        exerciseContentKm: null,
        instructionContentEn: null,
        instructionContentKm: null
      }));

      return NextResponse.json({
        success: true,
        modules
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch simulations' 
    }, { status: 500 });
  }
}

// Create new simulation
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
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
      simulation_url,
      simulation_file_path,
      tags,
      is_active,
      is_featured,
      learning_objectives_en,
      learning_objectives_km,
      preview_image,
      status,
      exercise_content_en,
      exercise_content_km,
      instruction_content_en,
      instruction_content_km
    } = body;

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
          simulation_url,
          tags,
          is_active,
          is_featured,
          learning_objectives_en,
          learning_objectives_km,
          preview_image
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
          grade_levels || [],
          estimated_duration,
          simulation_url,
          tags || [],
          is_active !== undefined ? is_active : true,
          is_featured || false,
          learning_objectives_en || [],
          learning_objectives_km || [],
          preview_image
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
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create simulation' 
    }, { status: 500 });
  }
}