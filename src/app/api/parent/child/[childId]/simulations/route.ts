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
    const session = await getSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has parent or guardian role
    if (!session.user.roles.includes('parent') && !session.user.roles.includes('guardian')) {
      return NextResponse.json({ error: 'Access denied. Parent role required.' }, { status: 403 });
    }

    const { childId } = params;

    const client = await pool.connect();
    try {
      // Verify parent-child relationship
      const relationshipCheck = await client.query(
        'SELECT 1 FROM parent_student_relationships WHERE parent_id = $1 AND student_id = $2',
        [session.user.id, childId]
      );

      if (relationshipCheck.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Access denied. You do not have permission to view this child\'s simulations.' 
        }, { status: 403 });
      }

      // Get child's simulation progress with detailed information
      const simulationsQuery = `
        SELECT 
          ssp.id,
          sc.id as simulation_id,
          sc.simulation_name,
          sc.display_name_en as title,
          sc.display_name_km as title_km,
          sc.description_en as description,
          sc.description_km as description_km,
          sc.subject_area as subject,
          sc.difficulty_level as difficulty,
          sc.grade_levels,
          sc.estimated_duration,
          ssp.progress_percentage,
          ssp.time_spent,
          ssp.attempts,
          ssp.best_score,
          ssp.completed,
          ssp.last_accessed,
          ssp.created_at as started_at,
          -- Get assignment info if exists
          sa.title as assignment_title,
          sa.due_date,
          sa.status as assignment_status,
          sa.score as assignment_score,
          sa.max_score as assignment_max_score,
          -- Get achievements for this simulation
          (SELECT COUNT(*) 
           FROM student_achievements ach 
           WHERE ach.student_id = ssp.student_id 
             AND ach.category = sc.subject_area) as subject_achievements
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog sc ON ssp.simulation_id = sc.id
        LEFT JOIN student_assignments sa ON sa.simulation_id = sc.id AND sa.student_id = ssp.student_id
        WHERE ssp.student_id = $1
        ORDER BY ssp.last_accessed DESC
      `;

      const result = await client.query(simulationsQuery, [childId]);
      
      // Get summary statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total_simulations,
          COUNT(CASE WHEN completed THEN 1 END) as completed_simulations,
          AVG(best_score) as average_score,
          SUM(time_spent) as total_time_spent,
          MAX(last_accessed) as last_activity,
          -- Subject breakdown
          COUNT(CASE WHEN sc.subject_area = 'Physics' THEN 1 END) as physics_count,
          COUNT(CASE WHEN sc.subject_area = 'Chemistry' THEN 1 END) as chemistry_count,
          COUNT(CASE WHEN sc.subject_area = 'Biology' THEN 1 END) as biology_count,
          COUNT(CASE WHEN sc.subject_area = 'Mathematics' THEN 1 END) as mathematics_count,
          -- Achievements count
          (SELECT COUNT(*) FROM student_achievements WHERE student_id = $1) as total_achievements
        FROM student_simulation_progress ssp
        JOIN stem_simulations_catalog sc ON ssp.simulation_id = sc.id
        WHERE ssp.student_id = $1
      `;

      const statsResult = await client.query(statsQuery, [childId]);
      
      const simulations = result.rows.map(row => ({
        id: row.id,
        simulationId: row.simulation_id,
        simulationName: row.simulation_name,
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
        assignment: row.assignment_title ? {
          title: row.assignment_title,
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
          Physics: parseInt(statsResult.rows[0].physics_count),
          Chemistry: parseInt(statsResult.rows[0].chemistry_count),
          Biology: parseInt(statsResult.rows[0].biology_count),
          Mathematics: parseInt(statsResult.rows[0].mathematics_count)
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