import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '@/lib/lms-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');

    const client = await pool.connect();

    try {
      let query = 'SELECT * FROM lab_skills WHERE 1=1';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (category) {
        query += ` AND skill_category = $${++paramCount}`;
        queryParams.push(category);
      }

      if (level) {
        query += ` AND skill_level = $${++paramCount}`;
        queryParams.push(level);
      }

      if (search) {
        query += ` AND (skill_name ILIKE $${++paramCount} OR skill_description ILIKE $${++paramCount})`;
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY skill_category, skill_name';

      const skillsResult = await client.query(query, queryParams);

      // Get usage statistics for each skill
      const usageResult = await client.query(
        `SELECT 
           lst.skill_id,
           COUNT(DISTINCT lst.lab_id) as labs_count,
           COUNT(DISTINCT cl.curriculum_id) as curricula_count,
           AVG(lst.skill_weight) as avg_weight
         FROM lab_skill_tags lst
         LEFT JOIN curriculum_labs cl ON lst.lab_id = cl.lab_id
         GROUP BY lst.skill_id`
      );

      const usageMap = usageResult.rows.reduce((acc, row) => {
        acc[row.skill_id] = {
          labs_count: parseInt(row.labs_count),
          curricula_count: parseInt(row.curricula_count),
          avg_weight: parseFloat(row.avg_weight)
        };
        return acc;
      }, {});

      // Add usage stats to skills
      const skillsWithUsage = skillsResult.rows.map(skill => ({
        ...skill,
        usage: usageMap[skill.id] || {
          labs_count: 0,
          curricula_count: 0,
          avg_weight: 0
        }
      }));

      // Group by category
      const skillsByCategory = skillsWithUsage.reduce((acc, skill) => {
        if (!acc[skill.skill_category]) {
          acc[skill.skill_category] = [];
        }
        acc[skill.skill_category].push(skill);
        return acc;
      }, {});

      // Get category statistics
      const categoryStats = await client.query(
        `SELECT 
           skill_category,
           COUNT(*) as total_skills,
           COUNT(CASE WHEN skill_level = 'beginner' THEN 1 END) as beginner_count,
           COUNT(CASE WHEN skill_level = 'intermediate' THEN 1 END) as intermediate_count,
           COUNT(CASE WHEN skill_level = 'advanced' THEN 1 END) as advanced_count
         FROM lab_skills
         GROUP BY skill_category
         ORDER BY skill_category`
      );

      return NextResponse.json({
        skills: skillsWithUsage,
        skillsByCategory,
        categoryStats: categoryStats.rows,
        total: skillsWithUsage.length
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only admins can create new skills
    const canCreate = await hasLMSPermission(session.user.id, 'skills', 'create') ||
                     await hasLMSPermission(session.user.id, 'curricula', 'create');
    
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      skill_name,
      skill_category,
      skill_description,
      skill_level = 'beginner',
      prerequisite_skills = [],
      related_subjects = []
    } = body;

    if (!skill_name || !skill_category) {
      return NextResponse.json(
        { error: 'skill_name and skill_category are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if skill already exists
      const existingSkill = await client.query(
        'SELECT id FROM lab_skills WHERE skill_name = $1',
        [skill_name]
      );

      if (existingSkill.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'A skill with this name already exists' },
          { status: 409 }
        );
      }

      // Create new skill
      const skillResult = await client.query(
        `INSERT INTO lab_skills (
          skill_name, skill_category, skill_description, skill_level,
          prerequisite_skills, related_subjects
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          skill_name,
          skill_category,
          skill_description,
          skill_level,
          JSON.stringify(prerequisite_skills),
          JSON.stringify(related_subjects)
        ]
      );

      const skill = skillResult.rows[0];

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'skills',
        'create',
        {
          skillId: skill.id,
          skillName: skill.skill_name,
          skillCategory: skill.skill_category,
          skillLevel: skill.skill_level
        },
        'skills',
        skill.id
      );

      return NextResponse.json({
        message: 'Skill created successfully',
        skill: {
          ...skill,
          usage: {
            labs_count: 0,
            curricula_count: 0,
            avg_weight: 0
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}