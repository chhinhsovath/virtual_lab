import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../lib/db';
import { getLMSSession, hasLMSPermission, logActivity } from '../../../lib/lms-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - only teachers and admins can create curricula
    const canCreate = await hasLMSPermission(session.user.id, 'curricula', 'create') ||
                     await hasLMSPermission(session.user.id, 'courses', 'update');
    
    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      academic_year,
      subject,
      grade,
      course_id,
      total_weeks = 36,
      start_date,
      end_date,
      is_public = false,
      tags = [],
      template_id // Optional: create from template
    } = body;

    if (!name || !academic_year) {
      return NextResponse.json(
        { error: 'Name and academic year are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let curriculumData = {
        name,
        description,
        academic_year,
        subject,
        grade,
        course_id: course_id || null,
        total_weeks,
        start_date: start_date || null,
        end_date: end_date || null,
        is_public,
        tags: JSON.stringify(tags)
      };

      // If creating from template, load template data
      if (template_id) {
        const templateResult = await client.query(
          'SELECT * FROM curriculum_templates WHERE id = $1',
          [template_id]
        );

        if (templateResult.rows.length > 0) {
          const template = templateResult.rows[0];
          // Override with template defaults
          curriculumData = {
            ...curriculumData,
            subject: curriculumData.subject || template.subject,
            grade: curriculumData.grade || template.grade,
            total_weeks: template.template_data?.total_weeks || total_weeks,
            tags: JSON.stringify([...tags, ...(template.tags || [])])
          };
        }
      }

      // Create curriculum
      const curriculumResult = await client.query(
        `INSERT INTO curriculums (
          name, description, academic_year, subject, grade, course_id,
          total_weeks, start_date, end_date, is_public, tags, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          curriculumData.name,
          curriculumData.description,
          curriculumData.academic_year,
          curriculumData.subject,
          curriculumData.grade,
          curriculumData.course_id,
          curriculumData.total_weeks,
          curriculumData.start_date,
          curriculumData.end_date,
          curriculumData.is_public,
          curriculumData.tags,
          session.user.id
        ]
      );

      const curriculum = curriculumResult.rows[0];

      // If created from template, also create the lab assignments
      if (template_id) {
        const templateResult = await client.query(
          'SELECT template_data FROM curriculum_templates WHERE id = $1',
          [template_id]
        );

        if (templateResult.rows.length > 0) {
          const templateData = templateResult.rows[0].template_data;
          
          // Create lab assignments from template
          if (templateData.labs && Array.isArray(templateData.labs)) {
            for (const labAssignment of templateData.labs) {
              await client.query(
                `INSERT INTO curriculum_labs (
                  curriculum_id, lab_id, week_number, order_in_week,
                  estimated_duration_minutes, is_required, due_date_offset,
                  teacher_notes, learning_objectives
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  curriculum.id,
                  labAssignment.lab_id,
                  labAssignment.week_number,
                  labAssignment.order_in_week || 1,
                  labAssignment.estimated_duration_minutes,
                  labAssignment.is_required !== false,
                  labAssignment.due_date_offset || 7,
                  labAssignment.teacher_notes || '',
                  labAssignment.learning_objectives || ''
                ]
              );
            }
          }
        }

        // Update template usage count
        await client.query(
          'UPDATE curriculum_templates SET usage_count = usage_count + 1 WHERE id = $1',
          [template_id]
        );
      }

      // Initialize progress for enrolled students if course_id provided
      if (course_id) {
        await client.query(
          'SELECT initialize_curriculum_progress($1, $2)',
          [curriculum.id, course_id]
        );
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'curriculum',
        'create',
        {
          curriculumId: curriculum.id,
          curriculumName: curriculum.name,
          academicYear: curriculum.academic_year,
          subject: curriculum.subject,
          grade: curriculum.grade,
          fromTemplate: !!template_id,
          templateId: template_id
        },
        'curricula',
        curriculum.id
      );

      // Return created curriculum with overview data
      const overviewResult = await client.query(
        'SELECT * FROM curriculum_overview WHERE curriculum_id = $1',
        [curriculum.id]
      );

      return NextResponse.json({
        message: 'Curriculum created successfully',
        curriculum: overviewResult.rows[0] || curriculum
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const academic_year = searchParams.get('academic_year');
    const course_id = searchParams.get('course_id');
    const status = searchParams.get('status') || 'active';
    const include_public = searchParams.get('include_public') === 'true';

    const client = await pool.connect();

    try {
      // Build query conditions
      let whereConditions = ['1=1'];
      let queryParams: any[] = [];
      let paramCount = 0;

      // Filter by user's own curricula or public ones
      if (include_public) {
        whereConditions.push(`(created_by_name = $${++paramCount} OR is_public = true OR curriculum_id IN (
          SELECT curriculum_id FROM curriculum_collaborators WHERE user_id = $${++paramCount}
        ))`);
        queryParams.push(session.user.name, session.user.id);
      } else {
        whereConditions.push(`(created_by_name = $${++paramCount} OR curriculum_id IN (
          SELECT curriculum_id FROM curriculum_collaborators WHERE user_id = $${++paramCount}
        ))`);
        queryParams.push(session.user.name, session.user.id);
      }

      if (subject) {
        whereConditions.push(`subject = $${++paramCount}`);
        queryParams.push(subject);
      }

      if (grade) {
        whereConditions.push(`grade = $${++paramCount}`);
        queryParams.push(grade);
      }

      if (academic_year) {
        whereConditions.push(`academic_year = $${++paramCount}`);
        queryParams.push(academic_year);
      }

      if (course_id) {
        whereConditions.push(`course_id = $${++paramCount}`);
        queryParams.push(course_id);
      }

      whereConditions.push(`status = $${++paramCount}`);
      queryParams.push(status);

      const query = `
        SELECT * FROM curriculum_overview 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY created_at DESC
      `;

      const curriculaResult = await client.query(query, queryParams);

      // Get available templates if requested
      const includeTemplates = searchParams.get('include_templates') === 'true';
      let templates = [];
      
      if (includeTemplates) {
        let templateQuery = 'SELECT * FROM curriculum_templates WHERE is_public = true';
        let templateParams: any[] = [];
        let templateParamCount = 0;

        if (subject) {
          templateQuery += ` AND subject = $${++templateParamCount}`;
          templateParams.push(subject);
        }

        if (grade) {
          templateQuery += ` AND grade = $${++templateParamCount}`;
          templateParams.push(grade);
        }

        templateQuery += ' ORDER BY usage_count DESC, created_at DESC';

        const templatesResult = await client.query(templateQuery, templateParams);
        templates = templatesResult.rows;
      }

      // Get user's collaboration info
      const collaborationsResult = await client.query(
        `SELECT curriculum_id, permission_level 
         FROM curriculum_collaborators 
         WHERE user_id = $1`,
        [session.user.id]
      );

      const collaborations = collaborationsResult.rows.reduce((acc, row) => {
        acc[row.curriculum_id] = row.permission_level;
        return acc;
      }, {});

      return NextResponse.json({
        curricula: curriculaResult.rows,
        templates,
        collaborations,
        total: curriculaResult.rows.length
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching curricula:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curricula' },
      { status: 500 }
    );
  }
}