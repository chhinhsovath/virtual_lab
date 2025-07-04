import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db';
import { getLMSSession, hasLMSPermission, canAccessCourse, logActivity } from '../../../../../lib/lms-auth';
import { handleFileUpload, FileStorage } from '../../../../../lib/storage';

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
    const client = await pool.connect();

    try {
      // Get lab details and verify access
      const labQuery = `
        SELECT l.*, c.id as course_id
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        WHERE l.id = $1
      `;

      const labResult = await client.query(labQuery, [labId]);
      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];

      // Check permissions
      const canUpdate = await hasLMSPermission(session.user.id, 'labs', 'update');
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'write');

      if (!canUpdate && !canAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Handle multipart form data
      const formData = await request.formData();
      const resourceType = formData.get('resource_type') as string;
      const version = formData.get('version') as string || '1.1';
      const title = formData.get('title') as string;
      const versionNote = formData.get('version_note') as string;

      // Validate required fields
      if (!resourceType || !title) {
        return NextResponse.json(
          { error: 'resource_type and title are required' },
          { status: 400 }
        );
      }

      // Validate resource type
      const validResourceTypes = ['simulation_html', 'worksheet', 'rubric', 'manual', 'video', 'document'];
      if (!validResourceTypes.includes(resourceType)) {
        return NextResponse.json(
          { error: 'Invalid resource_type' },
          { status: 400 }
        );
      }

      // Set allowed file types based on resource type
      let allowedTypes: string[] = [];
      let maxSize = 50 * 1024 * 1024; // 50MB default

      switch (resourceType) {
        case 'simulation_html':
          allowedTypes = ['text/html', 'application/zip'];
          maxSize = 100 * 1024 * 1024; // 100MB for simulations
          break;
        case 'worksheet':
        case 'rubric':
        case 'manual':
          allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          maxSize = 20 * 1024 * 1024; // 20MB for documents
          break;
        case 'video':
          allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
          maxSize = 200 * 1024 * 1024; // 200MB for videos
          break;
        case 'document':
          allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
          ];
          break;
      }

      // Upload file
      const uploadResult = await handleFileUpload(formData, 'file', {
        subPath: `labs/${lab.course_id}/${resourceType}`,
        maxSize,
        allowedTypes
      });

      if (Array.isArray(uploadResult) || !uploadResult.success) {
        return NextResponse.json(
          { error: (uploadResult as any).error || 'Upload failed' },
          { status: 400 }
        );
      }

      await client.query('BEGIN');

      // Create new resource version
      const resourceResult = await client.query(
        `INSERT INTO lms_lab_resources 
         (lab_id, resource_type, title, file_url, file_size, mime_type, version, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          labId,
          resourceType,
          title,
          uploadResult.url,
          uploadResult.size,
          (formData.get('file') as File)?.type || 'application/octet-stream',
          version,
          session.user.id
        ]
      );

      const resource = resourceResult.rows[0];

      // Update lab version if significant change
      if (versionNote) {
        const currentVersionResult = await client.query(
          'SELECT version FROM lms_lab_versions WHERE lab_id = $1 ORDER BY created_at DESC LIMIT 1',
          [labId]
        );

        let newVersion = '1.1';
        if (currentVersionResult.rows.length > 0) {
          const currentVersion = currentVersionResult.rows[0].version;
          const [major, minor] = currentVersion.split('.').map(Number);
          newVersion = `${major}.${minor + 1}`;
        }

        // Create new lab version entry
        await client.query(
          `INSERT INTO lms_lab_versions 
           (lab_id, version, change_description, created_by, lab_data)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            labId,
            newVersion,
            versionNote,
            session.user.id,
            JSON.stringify({
              ...lab,
              new_resource: resource,
              upload_timestamp: new Date().toISOString()
            })
          ]
        );

        // Update lab version
        await client.query(
          'UPDATE lms_labs SET version = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newVersion, labId]
        );
      }

      await client.query('COMMIT');

      await logActivity(
        session.user.id,
        'lab_resource',
        'upload',
        {
          labId,
          resourceType,
          version,
          fileUrl: uploadResult.url,
          fileSize: uploadResult.size
        },
        'labs',
        labId
      );

      return NextResponse.json({
        message: 'Resource uploaded successfully',
        resource,
        upload: uploadResult
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error uploading lab resource:', error);
    return NextResponse.json(
      { error: 'Failed to upload resource' },
      { status: 500 }
    );
  }
}

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
      // Get lab resources with version history
      const resourcesQuery = `
        SELECT 
          lr.*,
          u.name as uploaded_by_name,
          u.email as uploaded_by_email
        FROM lms_lab_resources lr
        LEFT JOIN users u ON lr.uploaded_by = u.id
        WHERE lr.lab_id = $1
        ORDER BY lr.resource_type, lr.uploaded_at DESC
      `;

      const resourcesResult = await client.query(resourcesQuery, [labId]);

      // Group resources by type
      const resourcesByType = resourcesResult.rows.reduce((acc, resource) => {
        if (!acc[resource.resource_type]) {
          acc[resource.resource_type] = [];
        }
        acc[resource.resource_type].push(resource);
        return acc;
      }, {});

      return NextResponse.json({
        resources: resourcesResult.rows,
        resourcesByType
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching lab resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab resources' },
      { status: 500 }
    );
  }
}