import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
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
      simulation_id, 
      session_id,
      assignment_id,
      answers, // { exercise_id: answer }
      time_spent 
    } = body;

    // Validate required fields
    if (!simulation_id || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: simulation_id and answers are required' },
        { status: 400 }
      );
    }

    console.log('Exercise submission:', {
      simulation_id,
      session_id,
      assignment_id,
      answer_count: Object.keys(answers).length,
      user_id: session.user_id || session.user?.id
    });

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get all exercises for this simulation
      const exercisesResult = await client.query(`
        SELECT 
          id,
          question_number,
          question_type,
          correct_answer,
          acceptable_answers,
          points
        FROM simulation_exercises
        WHERE simulation_id = $1 AND is_active = true
        ORDER BY question_number
      `, [simulation_id]);

      const exercises = exercisesResult.rows;
      let totalScore = 0;
      let maxScore = 0;
      const submissionDetails: any = {};

      console.log('Found exercises:', exercises.length);
      console.log('Answers received:', answers);

      // If no exercises found, return error
      if (exercises.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          error: 'No exercises found for this simulation',
          simulation_id
        }, { status: 404 });
      }

      // Process each answer
      for (const exercise of exercises) {
        maxScore += exercise.points;
        const studentAnswer = answers[exercise.id];
        
        if (studentAnswer) {
          let isCorrect = false;
          
          // Check answer based on question type
          if (exercise.question_type === 'multiple_choice' || exercise.question_type === 'true_false') {
            isCorrect = studentAnswer === exercise.correct_answer;
          } else if (exercise.question_type === 'calculation') {
            // Allow for small numeric differences
            const correct = parseFloat(exercise.correct_answer);
            const student = parseFloat(studentAnswer);
            isCorrect = !isNaN(correct) && !isNaN(student) && Math.abs(correct - student) < 0.01;
            
            // Check acceptable answers
            if (!isCorrect && exercise.acceptable_answers) {
              const acceptableAnswers = exercise.acceptable_answers as string[];
              isCorrect = acceptableAnswers.some(ans => {
                const acceptable = parseFloat(ans);
                return !isNaN(acceptable) && Math.abs(acceptable - student) < 0.01;
              });
            }
          } else if (exercise.question_type === 'short_answer') {
            // For short answers, just record - teacher will grade manually
            isCorrect = false; // Will be graded by teacher
          }

          const pointsEarned = isCorrect ? exercise.points : 0;
          totalScore += pointsEarned;

          // Insert submission record
          const studentId = session.user_id || session.user?.id;
          const studentIdColumn = typeof studentId === 'string' && studentId.includes('-') 
            ? 'student_uuid' : 'student_id';
          
          const submissionResult = await client.query(`
            INSERT INTO student_exercise_submissions (
              exercise_id,
              ${studentIdColumn},
              simulation_session_id,
              assignment_id,
              student_answer,
              is_correct,
              points_earned,
              time_spent,
              attempt_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
              COALESCE((
                SELECT MAX(attempt_number) + 1 
                FROM student_exercise_submissions 
                WHERE exercise_id = $1 AND ${studentIdColumn} = $2
              ), 1)
            )
            RETURNING id, is_correct, points_earned
          `, [
            exercise.id,
            studentId,
            session_id,
            assignment_id,
            studentAnswer,
            isCorrect,
            pointsEarned,
            Math.floor(time_spent / exercises.length) // Distribute time across questions
          ]);

          submissionDetails[exercise.id] = {
            submission_id: submissionResult.rows[0].id,
            is_correct: isCorrect,
            points_earned: pointsEarned
          };
        }
      }

      // Update assignment submission if this is part of an assignment
      if (assignment_id) {
        // First check if the table exists
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'student_assignment_submissions'
          )
        `);
        
        if (tableExists.rows[0].exists) {
          await client.query(`
            UPDATE student_assignment_submissions
            SET 
              score = $1,
              submitted_at = CURRENT_TIMESTAMP,
              status = 'completed'
            WHERE assignment_id = $2 AND ${studentIdColumn} = $3
          `, [totalScore, assignment_id, studentId]);
        } else {
          // If table doesn't exist, update the assignment progress directly
          await client.query(`
            UPDATE teacher_simulation_assignments
            SET metadata = jsonb_set(
              COALESCE(metadata, '{}'::jsonb),
              '{submissions}',
              COALESCE(metadata->'submissions', '{}'::jsonb) || 
              jsonb_build_object($2::text, jsonb_build_object(
                'score', $1,
                'submitted_at', $3,
                'status', 'completed'
              ))
            )
            WHERE id = $4
          `, [totalScore, studentId.toString(), new Date().toISOString(), assignment_id]);
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        submission: {
          total_score: totalScore,
          max_score: maxScore,
          percentage: Math.round((totalScore / maxScore) * 100),
          details: submissionDetails,
          submitted_at: new Date().toISOString()
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error submitting exercises:', error);
    return NextResponse.json(
      { error: 'Failed to submit exercises', details: error.message },
      { status: 500 }
    );
  }
}

// Get student's submissions
export async function GET(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const simulation_id = searchParams.get('simulation_id');
    const session_id = searchParams.get('session_id');

    const client = await pool.connect();
    
    try {
      const studentId = session.user_id || session.user?.id;
      const studentIdColumn = typeof studentId === 'string' && studentId.includes('-') 
        ? 'student_uuid' : 'student_id';
        
      let query = `
        SELECT 
          ses.*,
          se.question_number,
          se.question_type,
          se.question_km,
          se.points as max_points
        FROM student_exercise_submissions ses
        JOIN simulation_exercises se ON ses.exercise_id = se.id
        WHERE ses.${studentIdColumn} = $1
      `;
      const queryParams: any[] = [studentId];

      if (simulation_id) {
        query += ` AND se.simulation_id = $${queryParams.length + 1}`;
        queryParams.push(simulation_id);
      }

      if (session_id) {
        query += ` AND ses.simulation_session_id = $${queryParams.length + 1}`;
        queryParams.push(session_id);
      }

      query += ` ORDER BY se.question_number, ses.submitted_at DESC`;

      const result = await client.query(query, queryParams);

      return NextResponse.json({
        success: true,
        submissions: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    );
  }
}