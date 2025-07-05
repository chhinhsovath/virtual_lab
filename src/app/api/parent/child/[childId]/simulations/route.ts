import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

interface RouteParams {
  params: {
    childId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (session.user.role !== 'parent' && session.user.role !== 'guardian') {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM lms_parent_students WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s simulations.' 
        }, { status: 403 });
      }

      // Get child's lab activities with detailed information
      const simulationsQuery = `
        SELECT 
          sla.id,
          l.id as lab_id,
          l.title,
          l.title_km,
          l.description,
          l.description_km,
          l.subject,
          l.difficulty_level as difficulty,
          l.grade_levels,
          l.duration_minutes as estimated_duration,
          CASE 
            WHEN ls.status = 'submitted' THEN 100
            WHEN ls.status = 'in_progress' THEN 50
            ELSE 0
          END as progress_percentage,
          ls.duration_minutes as time_spent,
          1 as attempts,
          lsc.final_score as best_score,
          CASE WHEN ls.status = 'submitted' THEN true ELSE false END as completed,
          ls.start_time as last_accessed,
          ls.created_at as started_at,
          -- Get assignment info from submissions
          lsub.responses as assignment_data,
          lsub.submitted_at as due_date,
          ls.status as assignment_status,
          lsc.final_score as assignment_score,
          (SELECT SUM(max_points) FROM lab_rubric_criteria WHERE lab_id = l.id) as assignment_max_score,
          -- Get achievements count (placeholder)
          0 as subject_achievements
        FROM lms_student_lab_activities sla
        JOIN lms_labs l ON sla.lab_id = l.id
        LEFT JOIN lab_sessions ls ON sla.id = ls.id
        LEFT JOIN lab_submissions lsub ON ls.id = lsub.session_id
        LEFT JOIN lab_scores lsc ON l.id = lsc.lab_id AND sla.student_id = lsc.student_id
        WHERE sla.student_id = $1
        ORDER BY ls.start_time DESC
      `;

      const result = await client.query(simulationsQuery, [childId]);
      
      // Get summary statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_simulations,
          COUNT(CASE WHEN ls.status = 'submitted' THEN 1 END) as completed_simulations,
          AVG(lsc.final_score) as average_score,
          SUM(ls.duration_minutes) as total_time_spent,
          MAX(ls.start_time) as last_activity,
          -- Subject breakdown
          COUNT(CASE WHEN l.subject = 'Physics' THEN 1 END) as physics_count,
          COUNT(CASE WHEN l.subject = 'Chemistry' THEN 1 END) as chemistry_count,
          COUNT(CASE WHEN l.subject = 'Biology' THEN 1 END) as biology_count,
          COUNT(CASE WHEN l.subject = 'Mathematics' THEN 1 END) as mathematics_count,
          -- Achievements count (placeholder)
          0 as total_achievements
        FROM lms_student_lab_activities sla
        JOIN lms_labs l ON sla.lab_id = l.id
        LEFT JOIN lab_sessions ls ON sla.id = ls.id
        LEFT JOIN lab_scores lsc ON l.id = lsc.lab_id AND sla.student_id = lsc.student_id
        WHERE sla.student_id = $1
      `;

      const statsResult = await client.query(statsQuery, [childId]);
      
      const simulations = result.rows.map(row => ({
        id: row.id,
        simulationId: row.lab_id,
        simulationName: row.title,
        title: row.title,
        titleKm: row.title_km,
        description: row.description,
        descriptionKm: row.description_km,
        subject: row.subject,
        difficulty: row.difficulty,
        gradeLevels: row.grade_levels,
        estimatedDuration: row.estimated_duration,
        progress: {
          percentage: row.progress_percentage,
          timeSpent: row.time_spent,
          attempts: row.attempts,
          bestScore: row.best_score,
          completed: row.completed,
          lastAccessed: row.last_accessed,
          startedAt: row.started_at
        },
        assignment: row.assignment_data ? {
          title: `${row.title} Lab Assignment`,
          dueDate: row.due_date,
          status: row.assignment_status,
          score: row.assignment_score,
          maxScore: row.assignment_max_score
        } : null,
        subjectAchievements: row.subject_achievements
      }));

      const stats = statsResult.rows[0] ? {
        totalSimulations: parseInt(statsResult.rows[0].total_simulations),
        completedSimulations: parseInt(statsResult.rows[0].completed_simulations),
        averageScore: parseFloat(statsResult.rows[0].average_score) || 0,
        totalTimeSpent: parseInt(statsResult.rows[0].total_time_spent) || 0,
        lastActivity: statsResult.rows[0].last_activity,
        subjectBreakdown: {
          Physics: parseInt(statsResult.rows[0].physics_count) || 0,
          Chemistry: parseInt(statsResult.rows[0].chemistry_count) || 0,
          Biology: parseInt(statsResult.rows[0].biology_count) || 0,
          Mathematics: parseInt(statsResult.rows[0].mathematics_count) || 0
        },
        totalAchievements: parseInt(statsResult.rows[0].total_achievements)
      } : null;

      return NextResponse.json({
        success: true,
        simulations,
        stats
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching child simulations:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch simulations' 
    }, { status: 500 });
  }
}