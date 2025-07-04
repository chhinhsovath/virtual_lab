import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '@/lib/lms-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;

    const client = await pool.connect();

    try {
      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get current skill tags for this lab
      const skillTagsResult = await client.query(
        `SELECT 
           lst.*,
           ls.skill_name,
           ls.skill_category,
           ls.skill_description,
           ls.skill_level,
           ls.prerequisite_skills,
           ls.related_subjects
         FROM lab_skill_tags lst
         JOIN lab_skills ls ON lst.skill_id = ls.id
         WHERE lst.lab_id = $1
         ORDER BY ls.skill_category, ls.skill_name`,
        [labId]
      );

      // Get all available skills
      const allSkillsResult = await client.query(
        'SELECT * FROM lab_skills ORDER BY skill_category, skill_name'
      );

      // Group skills by category
      const skillsByCategory = allSkillsResult.rows.reduce((acc, skill) => {
        if (!acc[skill.skill_category]) {
          acc[skill.skill_category] = [];
        }
        acc[skill.skill_category].push(skill);
        return acc;
      }, {});

      return NextResponse.json({
        lab,
        currentSkills: skillTagsResult.rows,
        availableSkills: allSkillsResult.rows,
        skillsByCategory
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab skills' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;

    // Check permissions - only teachers and admins can tag skills
    const canTag = await hasLMSPermission(session.user.id, 'labs', 'update');
    if (!canTag) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { skill_id, skill_weight = 1.0, skill_assessment_type = 'practice' } = body;

    if (!skill_id) {
      return NextResponse.json(
        { error: 'skill_id is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'write');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Verify skill exists
      const skillResult = await client.query(
        'SELECT * FROM lab_skills WHERE id = $1',
        [skill_id]
      );

      if (skillResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
      }

      const skill = skillResult.rows[0];

      // Add skill tag (or update if exists)
      const tagResult = await client.query(
        `INSERT INTO lab_skill_tags (lab_id, skill_id, skill_weight, skill_assessment_type)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (lab_id, skill_id)
         DO UPDATE SET 
           skill_weight = $3,
           skill_assessment_type = $4,
           created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [labId, skill_id, skill_weight, skill_assessment_type]
      );

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_skills',
        'tag',
        {
          labId,
          labTitle: lab.title,
          skillId: skill_id,
          skillName: skill.skill_name,
          skillCategory: skill.skill_category,
          weight: skill_weight,
          assessmentType: skill_assessment_type
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Skill tagged successfully',
        tag: {
          ...tagResult.rows[0],
          skill_name: skill.skill_name,
          skill_category: skill.skill_category,
          skill_description: skill.skill_description,
          skill_level: skill.skill_level
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error tagging lab skill:', error);
    return NextResponse.json(
      { error: 'Failed to tag skill' },
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

    const labId = params.id;

    // Check permissions
    const canUpdate = await hasLMSPermission(session.user.id, 'labs', 'update');
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { skill_tags } = body; // Array of skill tag updates

    if (!Array.isArray(skill_tags)) {
      return NextResponse.json(
        { error: 'skill_tags must be an array' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'write');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Remove existing skill tags
      await client.query('DELETE FROM lab_skill_tags WHERE lab_id = $1', [labId]);

      // Add new skill tags
      const addedTags = [];
      for (const tag of skill_tags) {
        if (tag.skill_id) {
          const tagResult = await client.query(
            `INSERT INTO lab_skill_tags (lab_id, skill_id, skill_weight, skill_assessment_type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
              labId,
              tag.skill_id,
              tag.skill_weight || 1.0,
              tag.skill_assessment_type || 'practice'
            ]
          );
          addedTags.push(tagResult.rows[0]);
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_skills',
        'bulk_update',
        {
          labId,
          labTitle: lab.title,
          skillCount: addedTags.length,
          skillIds: addedTags.map(tag => tag.skill_id)
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Lab skills updated successfully',
        tags: addedTags
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating lab skills:', error);
    return NextResponse.json(
      { error: 'Failed to update skills' },
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

    const labId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const skillId = searchParams.get('skill_id');

    // Check permissions
    const canRemove = await hasLMSPermission(session.user.id, 'labs', 'update');
    if (!canRemove) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!skillId) {
      return NextResponse.json(
        { error: 'skill_id parameter is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'write');
      if (!canAccess) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get skill info for logging
      const skillResult = await client.query(
        'SELECT ls.skill_name FROM lab_skill_tags lst JOIN lab_skills ls ON lst.skill_id = ls.id WHERE lst.lab_id = $1 AND lst.skill_id = $2',
        [labId, skillId]
      );

      // Remove skill tag
      const deleteResult = await client.query(
        'DELETE FROM lab_skill_tags WHERE lab_id = $1 AND skill_id = $2',
        [labId, skillId]
      );

      if (deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Skill tag not found' }, { status: 404 });
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_skills',
        'untag',
        {
          labId,
          labTitle: lab.title,
          skillId,
          skillName: skillResult.rows[0]?.skill_name
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Skill tag removed successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error removing lab skill tag:', error);
    return NextResponse.json(
      { error: 'Failed to remove skill tag' },
      { status: 500 }
    );
  }
}