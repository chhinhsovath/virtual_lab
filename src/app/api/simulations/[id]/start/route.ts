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

    const body = await request.json();
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

      // Check for existing active session
      // First check which columns exist in the table
      const columnCheckResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'student_simulation_progress' 
        AND column_name IN ('student_id', 'student_uuid')
      `);
      
      const hasStudentUuid = columnCheckResult.rows.some(row => row.column_name === 'student_uuid');
      const hasStudentId = columnCheckResult.rows.some(row => row.column_name === 'student_id');
      
      // Determine which column to use based on what exists and the ID format
      let studentIdColumn: string | null = null;
      let studentIdValue = session.user_id;
      
      if (typeof session.user_id === 'string' && session.user_id.includes('-')) {
        // This is a UUID
        if (hasStudentUuid) {
          studentIdColumn = 'student_uuid';
        } else {
          // UUID user but no student_uuid column - can't query
          console.log('Warning: UUID user but student_uuid column does not exist');
        }
      } else {
        // This is an integer ID
        if (hasStudentId) {
          studentIdColumn = 'student_id';
        }
      }
      
      let existingSessionResult;
      if (studentIdColumn) {
        existingSessionResult = await client.query(`
          SELECT id, started_at, current_progress
          FROM student_simulation_progress 
          WHERE ${studentIdColumn} = $1 AND simulation_id = $2 AND completed_at IS NULL
          ORDER BY started_at DESC
          LIMIT 1
        `, [studentIdValue, params.id]);
      } else {
        existingSessionResult = { rows: [] };
      }

      let sessionData;

      if (existingSessionResult.rows.length > 0) {
        // Resume existing session
        sessionData = existingSessionResult.rows[0];
        
        // Update last accessed time
        await client.query(`
          UPDATE student_simulation_progress 
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [sessionData.id]);
      } else {
        // Create new session only if we have a valid column to use
        if (studentIdColumn) {
          const insertColumns = studentIdColumn === 'student_uuid' 
            ? 'student_uuid, simulation_id, assignment_id, started_at, current_progress'
            : 'student_id, simulation_id, assignment_id, started_at, current_progress';
            
          const newSessionResult = await client.query(`
            INSERT INTO student_simulation_progress (
              ${insertColumns}
            ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, '{}')
            RETURNING *
          `, [session.user_id, params.id, assignment_id]);

          sessionData = newSessionResult.rows[0];
        } else {
          // Can't create session - return a mock session
          console.log('Cannot create session - no compatible student ID column');
          sessionData = {
            id: `mock-${Date.now()}`,
            student_id: session.user_id,
            simulation_id: params.id,
            started_at: new Date(),
            current_progress: {}
          };
        }
      }

      // Log the activity
      await client.query(`
        INSERT INTO lms_activity_logs (
          user_id, activity_type, action, details
        ) VALUES ($1, 'simulation', 'start', $2)
      `, [
        session.user_uuid || session.user.id,
        JSON.stringify({
          simulation_id: params.id,
          simulation_name: simulation.simulation_name,
          session_id: sessionData.id,
          assignment_id: assignment_id
        })
      ]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        session: {
          id: sessionData.id,
          simulation_id: params.id,
          simulation_url: simulation.simulation_url,
          display_name_en: simulation.display_name_en,
          display_name_km: simulation.display_name_km,
          started_at: sessionData.started_at,
          current_progress: sessionData.current_progress
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
    console.error('Error message:', error.message);
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
    
    // In development, use mock session if no real session exists
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      current_progress, 
      time_spent, 
      current_score, 
      simulation_data,
      is_completed = false 
    } = body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Find the active session
      const studentIdColumn = typeof session.user_id === 'string' && session.user_id.includes('-') 
        ? 'student_uuid' : 'student_id';
        
      const sessionResult = await client.query(`
        SELECT id, total_time_spent, best_score, attempts_count
        FROM student_simulation_progress 
        WHERE ${studentIdColumn} = $1 AND simulation_id = $2 AND completed_at IS NULL
        ORDER BY started_at DESC
        LIMIT 1
      `, [session.user_id, params.id]);

      if (sessionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'No active session found' }, { status: 404 });
      }

      const currentSession = sessionResult.rows[0];
      const newTotalTime = (currentSession.total_time_spent || 0) + (time_spent || 0);
      const newBestScore = Math.max(currentSession.best_score || 0, current_score || 0);
      const completedAt = is_completed ? new Date() : null;

      // Update progress
      await client.query(`
        UPDATE student_simulation_progress 
        SET 
          current_progress = $1,
          total_time_spent = $2,
          current_score = $3,
          best_score = $4,
          simulation_data = $5,
          completed_at = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
      `, [
        current_progress,
        newTotalTime,
        current_score,
        newBestScore,
        simulation_data,
        completedAt,
        currentSession.id
      ]);

      // If completed, check for achievements
      if (is_completed) {
        await checkAndAwardAchievements(client, session.student_id, params.id, {
          total_time: newTotalTime,
          best_score: newBestScore,
          attempts: currentSession.attempts_count + 1
        });
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: is_completed ? 'Simulation completed successfully' : 'Progress saved successfully',
        session: {
          id: currentSession.id,
          total_time_spent: newTotalTime,
          best_score: newBestScore,
          completed: is_completed
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating simulation progress:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation progress' },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(client: any, studentId: number, simulationId: string, stats: any) {
  try {
    // Check for achievements that might be unlocked
    const achievementChecks = [
      {
        name: 'First Launch',
        condition: stats.attempts === 1,
        type: 'first_start'
      },
      {
        name: 'Quick Learner',
        condition: stats.total_time <= 30,
        type: 'time_under'
      },
      {
        name: 'Perfect Score',
        condition: stats.best_score >= 100,
        type: 'perfect_score'
      }
    ];

    for (const check of achievementChecks) {
      if (check.condition) {
        // Check if achievement exists and student hasn't already earned it
        const achievementResult = await client.query(`
          SELECT sa.id, sa.name, sa.points
          FROM simulation_achievements sa
          WHERE sa.name = $1 AND sa.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM student_achievements sua
            WHERE sua.student_id = $2 AND sua.achievement_id = sa.id
          )
        `, [check.name, studentId]);

        if (achievementResult.rows.length > 0) {
          const achievement = achievementResult.rows[0];
          
          // Award the achievement
          await client.query(`
            INSERT INTO student_achievements (student_id, achievement_id, simulation_id, points_earned)
            VALUES ($1, $2, $3, $4)
          `, [studentId, achievement.id, simulationId, achievement.points]);
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}