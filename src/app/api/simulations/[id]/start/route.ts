import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getAPISession(request);
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { assignment_id } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if simulation exists
      const simulationResult = await client.query(`
        SELECT id, simulation_name, display_name_en, display_name_km, simulation_url
        FROM stem_simulations_catalog 
        WHERE id = $1 AND is_active = true
      `, [params.id]);

      if (simulationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      }

      const simulation = simulationResult.rows[0];
      const studentUuid = session.user_uuid || session.user_id;

      // Check for existing progress record
      const existingResult = await client.query(`
        SELECT id, progress_percentage, time_spent, attempts, best_score, completed, last_accessed
        FROM student_simulation_progress 
        WHERE student_uuid = $1 AND simulation_id = $2
      `, [studentUuid, params.id]);

      let sessionData;

      if (existingResult.rows.length > 0) {
        // Update existing record
        sessionData = existingResult.rows[0];
        
        await client.query(`
          UPDATE student_simulation_progress 
          SET attempts = attempts + 1, last_accessed = NOW()
          WHERE id = $1
        `, [sessionData.id]);
        
        sessionData.attempts += 1;
      } else {
        // Create new progress record
        const newSessionResult = await client.query(`
          INSERT INTO student_simulation_progress (
            student_uuid, simulation_id, progress_percentage, time_spent, attempts, best_score, completed, last_accessed, created_at
          ) VALUES ($1, $2, 0, 0, 1, 0.0, false, NOW(), NOW())
          RETURNING *
        `, [studentUuid, params.id]);

        sessionData = newSessionResult.rows[0];
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        session: {
          id: sessionData.id,
          simulation_id: params.id,
          simulation_url: simulation.simulation_url,
          display_name_en: simulation.display_name_en,
          display_name_km: simulation.display_name_km,
          progress_percentage: sessionData.progress_percentage || 0,
          time_spent: sessionData.time_spent || 0,
          attempts: sessionData.attempts || 1,
          best_score: sessionData.best_score || 0,
          completed: sessionData.completed || false
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error starting simulation:', error);
    return NextResponse.json(
      { error: 'Failed to start simulation', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getAPISession(request);
    
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      progress_percentage, 
      time_spent_increment, 
      current_score, 
      is_completed = false 
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const studentUuid = session.user_uuid || session.user_id;
      
      // Find the progress record
      const sessionResult = await client.query(`
        SELECT id, time_spent, best_score, completed
        FROM student_simulation_progress 
        WHERE student_uuid = $1 AND simulation_id = $2
      `, [studentUuid, params.id]);

      if (sessionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'No progress record found' }, { status: 404 });
      }

      const currentSession = sessionResult.rows[0];
      const newTotalTime = (currentSession.time_spent || 0) + (time_spent_increment || 0);
      const newBestScore = Math.max(currentSession.best_score || 0, current_score || 0);

      // Update progress
      const updateResult = await client.query(`
        UPDATE student_simulation_progress 
        SET 
          progress_percentage = COALESCE($1, progress_percentage),
          time_spent = $2,
          best_score = $3,
          completed = $4,
          last_accessed = NOW()
        WHERE id = $5
        RETURNING *
      `, [
        progress_percentage,
        newTotalTime,
        newBestScore,
        is_completed,
        currentSession.id
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: is_completed ? 'Simulation completed successfully' : 'Progress saved successfully',
        session: updateResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating simulation progress:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation progress', details: error.message },
      { status: 500 }
    );
  }
}