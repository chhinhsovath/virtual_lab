import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '@/lib/lms-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const curriculumId = params.id;

    const client = await pool.connect();

    try {
      // Get curriculum overview
      const curriculumResult = await client.query(
        'SELECT * FROM curriculum_overview WHERE curriculum_id = $1',
        [curriculumId]
      );

      if (curriculumResult.rows.length === 0) {
        return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
      }

      const curriculum = curriculumResult.rows[0];

      // Check access permissions
      const hasAccess = curriculum.created_by_name === session.user.name || 
                       curriculum.is_public ||
                       await checkCollaboratorAccess(client, curriculumId, session.user.id);

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get detailed timeline with labs
      const timelineResult = await client.query(
        'SELECT * FROM curriculum_timeline WHERE curriculum_id = $1',
        [curriculumId]
      );

      // Get available labs for assignment (if user can edit)
      const canEdit = curriculum.created_by_name === session.user.name ||
                     await checkCollaboratorPermission(client, curriculumId, session.user.id, 'edit');

      let availableLabs = [];
      if (canEdit) {
        const labsQuery = `
          SELECT l.*, 
                 COALESCE(
                   JSON_AGG(
                     DISTINCT JSONB_BUILD_OBJECT(
                       'skill_id', ls.id,
                       'skill_name', ls.skill_name,
                       'skill_category', ls.skill_category,
                       'skill_level', ls.skill_level
                     )
                   ) FILTER (WHERE ls.id IS NOT NULL),
                   '[]'::json
                 ) as skills
          FROM lms_labs l
          LEFT JOIN lab_skill_tags lst ON l.id = lst.lab_id
          LEFT JOIN lab_skills ls ON lst.skill_id = ls.id
          WHERE l.status = 'published'
            AND (l.subject = $1 OR $1 IS NULL)
            AND (l.grade = $2 OR $2 IS NULL)
          GROUP BY l.id
          ORDER BY l.title
        `;

        const availableLabsResult = await client.query(labsQuery, [
          curriculum.subject,
          curriculum.grade
        ]);
        availableLabs = availableLabsResult.rows;
      }

      // Get skill coverage summary
      const skillsResult = await client.query(
        `SELECT 
           ls.skill_category,
           COUNT(DISTINCT ls.id) as skills_count,
           COUNT(DISTINCT cl.lab_id) as labs_using_category,
           JSON_AGG(
             DISTINCT JSONB_BUILD_OBJECT(
               'skill_name', ls.skill_name,
               'skill_level', ls.skill_level,
               'labs_count', skill_labs.labs_count
             )
           ) as skills_details
         FROM lab_skills ls
         LEFT JOIN lab_skill_tags lst ON ls.id = lst.skill_id
         LEFT JOIN curriculum_labs cl ON lst.lab_id = cl.lab_id AND cl.curriculum_id = $1
         LEFT JOIN (
           SELECT lst2.skill_id, COUNT(DISTINCT cl2.lab_id) as labs_count
           FROM lab_skill_tags lst2
           JOIN curriculum_labs cl2 ON lst2.lab_id = cl2.lab_id
           WHERE cl2.curriculum_id = $1
           GROUP BY lst2.skill_id
         ) skill_labs ON ls.id = skill_labs.skill_id
         GROUP BY ls.skill_category
         ORDER BY ls.skill_category`,
        [curriculumId]
      );

      // Get collaborators if user has permission
      let collaborators = [];
      if (canEdit || curriculum.created_by_name === session.user.name) {
        const collaboratorsResult = await client.query(
          `SELECT cc.*, u.name as collaborator_name, u.email as collaborator_email
           FROM curriculum_collaborators cc
           JOIN users u ON cc.user_id = u.id
           WHERE cc.curriculum_id = $1
           ORDER BY cc.invited_at DESC`,
          [curriculumId]
        );
        collaborators = collaboratorsResult.rows;
      }

      // Get student progress if course is linked
      let studentProgress = [];
      if (curriculum.course_id && canEdit) {
        const progressResult = await client.query(
          `SELECT cp.*, u.name as student_name
           FROM curriculum_progress cp
           JOIN users u ON cp.student_id = u.id
           WHERE cp.curriculum_id = $1
           ORDER BY u.name`,
          [curriculumId]
        );
        studentProgress = progressResult.rows;
      }

      // Build week-by-week structure
      const weeklyStructure: any = {};
      for (let week = 1; week <= curriculum.total_weeks; week++) {
        weeklyStructure[week] = {
          week_number: week,
          labs: [],
          total_duration: 0,
          required_labs: 0,
          optional_labs: 0
        };
      }

      // Populate with actual lab assignments
      timelineResult.rows.forEach(lab => {
        const week = lab.week_number;
        if (weeklyStructure[week]) {
          weeklyStructure[week].labs.push(lab);
          weeklyStructure[week].total_duration += lab.curriculum_duration_override || lab.lab_duration || 0;
          if (lab.is_required) {
            weeklyStructure[week].required_labs++;
          } else {
            weeklyStructure[week].optional_labs++;
          }
        }
      });

      await logActivity(
        session.user.id,
        'curriculum',
        'view',
        {
          curriculumId,
          curriculumName: curriculum.curriculum_name,
          totalLabs: curriculum.total_labs,
          totalWeeks: curriculum.total_weeks
        },
        'curricula',
        curriculumId
      );

      return NextResponse.json({
        curriculum,
        timeline: timelineResult.rows,
        weeklyStructure,
        availableLabs,
        skillsCoverage: skillsResult.rows,
        collaborators,
        studentProgress,
        permissions: {
          canEdit,
          canShare: curriculum.created_by_name === session.user.name,
          canDelete: curriculum.created_by_name === session.user.name
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const curriculumId = params.id;
    const body = await request.json();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check edit permissions
      const canEdit = await checkEditPermission(client, curriculumId, session.user.id);
      if (!canEdit) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Handle different types of updates
      const { action } = body;

      switch (action) {
        case 'update_info':
          await updateCurriculumInfo(client, curriculumId, body, session.user.id);
          break;
        case 'assign_labs':
          await assignLabsToTimeline(client, curriculumId, body.lab_assignments, session.user.id);
          break;
        case 'remove_lab':
          await removeLabFromTimeline(client, curriculumId, body.lab_id, session.user.id);
          break;
        case 'reorder_labs':
          await reorderLabsInTimeline(client, curriculumId, body.reorder_data, session.user.id);
          break;
        case 'update_lab_details':
          await updateLabInTimeline(client, curriculumId, body.lab_id, body.updates, session.user.id);
          break;
        default:
          await client.query('ROLLBACK');
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      // Update curriculum timestamp
      await client.query(
        'UPDATE curriculums SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [curriculumId]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'curriculum',
        action || 'update',
        {
          curriculumId,
          action,
          changes: body
        },
        'curricula',
        curriculumId
      );

      return NextResponse.json({
        message: 'Curriculum updated successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to update curriculum' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const curriculumId = params.id;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user is the owner
      const curriculumResult = await client.query(
        'SELECT created_by, name FROM curriculums WHERE id = $1',
        [curriculumId]
      );

      if (curriculumResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
      }

      const curriculum = curriculumResult.rows[0];
      if (curriculum.created_by !== session.user.id) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Only the creator can delete this curriculum' }, { status: 403 });
      }

      // Delete curriculum (cascade will handle related records)
      await client.query('DELETE FROM curriculums WHERE id = $1', [curriculumId]);

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'curriculum',
        'delete',
        {
          curriculumId,
          curriculumName: curriculum.name
        },
        'curricula',
        curriculumId
      );

      return NextResponse.json({
        message: 'Curriculum deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to delete curriculum' },
      { status: 500 }
    );
  }
}

// Helper functions
async function checkCollaboratorAccess(client: any, curriculumId: string, userId: string): Promise<boolean> {
  const result = await client.query(
    'SELECT id FROM curriculum_collaborators WHERE curriculum_id = $1 AND user_id = $2',
    [curriculumId, userId]
  );
  return result.rows.length > 0;
}

async function checkCollaboratorPermission(client: any, curriculumId: string, userId: string, permission: string): Promise<boolean> {
  const result = await client.query(
    'SELECT permission_level FROM curriculum_collaborators WHERE curriculum_id = $1 AND user_id = $2',
    [curriculumId, userId]
  );
  
  if (result.rows.length === 0) return false;
  
  const level = result.rows[0].permission_level;
  return level === 'admin' || level === permission;
}

async function checkEditPermission(client: any, curriculumId: string, userId: string): Promise<boolean> {
  const result = await client.query(
    'SELECT created_by FROM curriculums WHERE id = $1',
    [curriculumId]
  );
  
  if (result.rows.length === 0) return false;
  if (result.rows[0].created_by === userId) return true;
  
  return await checkCollaboratorPermission(client, curriculumId, userId, 'edit');
}

async function updateCurriculumInfo(client: any, curriculumId: string, updates: any, userId: string) {
  const allowedFields = ['name', 'description', 'total_weeks', 'start_date', 'end_date', 'tags', 'status'];
  const setClause = [];
  const values = [];
  let paramCount = 0;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClause.push(`${field} = $${++paramCount}`);
      values.push(field === 'tags' ? JSON.stringify(updates[field]) : updates[field]);
    }
  }

  if (setClause.length > 0) {
    values.push(curriculumId);
    await client.query(
      `UPDATE curriculums SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${++paramCount}`,
      values
    );
  }
}

async function assignLabsToTimeline(client: any, curriculumId: string, labAssignments: any[], userId: string) {
  for (const assignment of labAssignments) {
    await client.query(
      `INSERT INTO curriculum_labs (
        curriculum_id, lab_id, week_number, order_in_week,
        estimated_duration_minutes, is_required, due_date_offset,
        teacher_notes, learning_objectives, prerequisites
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (curriculum_id, lab_id) 
      DO UPDATE SET 
        week_number = $3,
        order_in_week = $4,
        estimated_duration_minutes = $5,
        is_required = $6,
        due_date_offset = $7,
        teacher_notes = $8,
        learning_objectives = $9,
        prerequisites = $10,
        updated_at = CURRENT_TIMESTAMP`,
      [
        curriculumId,
        assignment.lab_id,
        assignment.week_number,
        assignment.order_in_week || 1,
        assignment.estimated_duration_minutes,
        assignment.is_required !== false,
        assignment.due_date_offset || 7,
        assignment.teacher_notes || '',
        assignment.learning_objectives || '',
        assignment.prerequisites || ''
      ]
    );
  }
}

async function removeLabFromTimeline(client: any, curriculumId: string, labId: string, userId: string) {
  await client.query(
    'DELETE FROM curriculum_labs WHERE curriculum_id = $1 AND lab_id = $2',
    [curriculumId, labId]
  );
}

async function reorderLabsInTimeline(client: any, curriculumId: string, reorderData: any[], userId: string) {
  for (const item of reorderData) {
    await client.query(
      'UPDATE curriculum_labs SET week_number = $1, order_in_week = $2, updated_at = CURRENT_TIMESTAMP WHERE curriculum_id = $3 AND lab_id = $4',
      [item.week_number, item.order_in_week, curriculumId, item.lab_id]
    );
  }
}

async function updateLabInTimeline(client: any, curriculumId: string, labId: string, updates: any, userId: string) {
  const allowedFields = ['estimated_duration_minutes', 'is_required', 'due_date_offset', 'teacher_notes', 'learning_objectives', 'prerequisites'];
  const setClause = [];
  const values = [];
  let paramCount = 0;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      setClause.push(`${field} = $${++paramCount}`);
      values.push(updates[field]);
    }
  }

  if (setClause.length > 0) {
    values.push(curriculumId, labId);
    await client.query(
      `UPDATE curriculum_labs SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE curriculum_id = $${++paramCount} AND lab_id = $${++paramCount}`,
      values
    );
  }
}