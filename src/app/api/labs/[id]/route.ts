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
      // Get lab details
      const labQuery = `
        SELECT 
          l.*,
          c.title as course_title,
          c.code as course_code,
          c.id as course_id,
          u.name as created_by_name,
          COUNT(DISTINCT sla.student_id) as students_attempted,
          COUNT(DISTINCT sla.student_id) FILTER (WHERE sla.status = 'submitted') as students_completed,
          AVG(sla.score) FILTER (WHERE sla.status = 'submitted') as average_score,
          MAX(sla.score) as max_score,
          MIN(sla.score) FILTER (WHERE sla.score > 0) as min_score
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        LEFT JOIN users u ON l.created_by = u.id
        LEFT JOIN lms_student_lab_activities sla ON l.id = sla.lab_id
        WHERE l.id = $1
        GROUP BY l.id, c.title, c.code, c.id, u.name
      `;

      const labResult = await client.query(labQuery, [labId]);
      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];

      // Check if user can access this lab
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Get lab resources
      const resourcesQuery = `
        SELECT *
        FROM lms_lab_resources
        WHERE lab_id = $1
        ORDER BY resource_type, title
      `;
      const resourcesResult = await client.query(resourcesQuery, [labId]);

      // Get lab versions (for instructors/admins)
      let versions = [];
      const canViewVersions = await hasLMSPermission(session.user.id, 'labs', 'update') ||
        await canAccessCourse(session.user.id, lab.course_id, 'write');
      
      if (canViewVersions) {
        const versionsQuery = `
          SELECT 
            lv.*,
            u.name as created_by_name
          FROM lms_lab_versions lv
          LEFT JOIN users u ON lv.created_by = u.id
          WHERE lv.lab_id = $1
          ORDER BY lv.created_at DESC
        `;
        const versionsResult = await client.query(versionsQuery, [labId]);
        versions = versionsResult.rows;
      }

      // Get student's activity for this lab (if student)
      let studentActivity = null;
      if (session.user.role_name === 'student') {
        const activityQuery = `
          SELECT *
          FROM lms_student_lab_activities
          WHERE lab_id = $1 AND student_id = $2
          ORDER BY created_at DESC
          LIMIT 1
        `;
        const activityResult = await client.query(activityQuery, [labId, session.user.id]);
        if (activityResult.rows.length > 0) {
          studentActivity = activityResult.rows[0];
        }
      }

      // Get recent student activities (for instructors)
      let recentActivities = [];
      if (canViewVersions) {
        const activitiesQuery = `
          SELECT 
            sla.*,
            u.name as student_name,
            u.email as student_email
          FROM lms_student_lab_activities sla
          LEFT JOIN users u ON sla.student_id = u.id
          WHERE sla.lab_id = $1
          ORDER BY sla.created_at DESC
          LIMIT 10
        `;
        const activitiesResult = await client.query(activitiesQuery, [labId]);
        recentActivities = activitiesResult.rows;
      }

      await logActivity(
        session.user.id,
        'lab',
        'view',
        { labId },
        'labs',
        labId
      );

      return NextResponse.json({
        lab,
        resources: resourcesResult.rows,
        versions,
        studentActivity,
        recentActivities
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const labId = params.id;
    const body = await request.json();
    const {
      title,
      title_km,
      description,
      description_km,
      simulation_url,
      duration_minutes,
      max_attempts,
      is_published,
      change_description,
      resources
    } = body;

    const client = await pool.connect();
    try {
      // Get current lab data
      const currentLabResult = await client.query(
        'SELECT * FROM lms_labs WHERE id = $1',
        [labId]
      );

      if (currentLabResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const currentLab = currentLabResult.rows[0];

      // Check permissions
      const canUpdate = await hasLMSPermission(session.user.id, 'labs', 'update');
      const canAccess = await canAccessCourse(session.user.id, currentLab.course_id, 'write');

      if (!canUpdate && !canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      await client.query('BEGIN');

      // Update lab
      const updateQuery = `
        UPDATE lms_labs 
        SET 
          title = COALESCE($1, title),
          title_km = COALESCE($2, title_km),
          description = COALESCE($3, description),
          description_km = COALESCE($4, description_km),
          simulation_url = COALESCE($5, simulation_url),
          duration_minutes = COALESCE($6, duration_minutes),
          max_attempts = COALESCE($7, max_attempts),
          is_published = COALESCE($8, is_published),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;

      const labResult = await client.query(updateQuery, [
        title,
        title_km,
        description,
        description_km,
        simulation_url,
        duration_minutes,
        max_attempts,
        is_published,
        labId
      ]);

      const updatedLab = labResult.rows[0];

      // Create new version if significant changes
      const hasSignificantChanges = 
        title !== currentLab.title ||
        description !== currentLab.description ||
        simulation_url !== currentLab.simulation_url;

      if (hasSignificantChanges) {
        // Get current version number
        const versionResult = await client.query(
          'SELECT version FROM lms_lab_versions WHERE lab_id = $1 ORDER BY created_at DESC LIMIT 1',
          [labId]
        );

        let newVersion = '1.1';
        if (versionResult.rows.length > 0) {
          const currentVersion = versionResult.rows[0].version;
          const [major, minor] = currentVersion.split('.').map(Number);
          newVersion = `${major}.${minor + 1}`;
        }

        await client.query(
          `INSERT INTO lms_lab_versions 
           (lab_id, version, change_description, created_by, lab_data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            labId,
            newVersion,
            change_description || 'Updated lab content',
            session.user.id,
            JSON.stringify(updatedLab)
          ]
        );
      }

      // Update resources if provided
      if (resources && Array.isArray(resources)) {
        // Delete existing resources
        await client.query(
          'DELETE FROM lms_lab_resources WHERE lab_id = $1',
          [labId]
        );

        // Insert new resources
        for (const resource of resources) {
          await client.query(
            `INSERT INTO lms_lab_resources 
             (lab_id, resource_type, title, file_url, file_size, mime_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              labId,
              resource.resource_type,
              resource.title,
              resource.file_url,
              resource.file_size,
              resource.mime_type
            ]
          );
        }
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab',
        'update',
        { labId, changes: Object.keys(body) },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Lab updated successfully',
        lab: updatedLab
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: 'Failed to update lab' },
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
    
    const canDelete = await hasLMSPermission(session.user.id, 'labs', 'delete');
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      // Check if lab has student activities
      const activitiesResult = await client.query(
        'SELECT COUNT(*) as count FROM lms_student_lab_activities WHERE lab_id = $1',
        [labId]
      );

      const hasActivities = parseInt(activitiesResult.rows[0].count) > 0;

      if (hasActivities) {
        // Soft delete by marking as unpublished
        await client.query(
          'UPDATE lms_labs SET is_published = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [labId]
        );

        await logActivity(
          session.user.id,
          'lab',
          'unpublish',
          { labId, reason: 'Has student activities' },
          'labs',
          labId
        );

        return NextResponse.json({
          message: 'Lab unpublished (has student activities)',
          action: 'unpublished'
        });
      } else {
        // Hard delete
        await client.query('BEGIN');
        
        await client.query('DELETE FROM lms_lab_resources WHERE lab_id = $1', [labId]);
        await client.query('DELETE FROM lms_lab_versions WHERE lab_id = $1', [labId]);
        await client.query('DELETE FROM lms_labs WHERE id = $1', [labId]);
        
        await client.query('COMMIT');

        await logActivity(
          session.user.id,
          'lab',
          'delete',
          { labId },
          'labs',
          labId
        );

        return NextResponse.json({
          message: 'Lab deleted successfully',
          action: 'deleted'
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab' },
      { status: 500 }
    );
  }
}