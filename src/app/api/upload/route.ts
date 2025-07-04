import { NextRequest, NextResponse } from 'next/server';
import { getLMSSession, hasLMSPermission, logActivity } from '../../../lib/lms-auth';
import { 
  handleFileUpload, 
  FileStorage,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_SIMULATION_TYPES,
  ALL_ALLOWED_TYPES
} from '../../../lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getLMSSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can upload files
    const canUpload = await hasLMSPermission(session.user.id, 'labs', 'create') ||
                     await hasLMSPermission(session.user.id, 'assignments', 'create');
    
    if (!canUpload) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const uploadType = formData.get('type') as string || 'general';
    const courseId = formData.get('course_id') as string;
    const resourceType = formData.get('resource_type') as string;

    // Validate upload type and set appropriate restrictions
    let allowedTypes: string[] = ALL_ALLOWED_TYPES;
    let maxSize = 50 * 1024 * 1024; // 50MB default
    let subPath = 'general';

    switch (uploadType) {
      case 'simulation':
        allowedTypes = ALLOWED_SIMULATION_TYPES;
        maxSize = 100 * 1024 * 1024; // 100MB for simulations
        subPath = `simulations/${courseId || 'general'}`;
        break;
      case 'document':
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        maxSize = 20 * 1024 * 1024; // 20MB for documents
        subPath = `documents/${courseId || 'general'}`;
        break;
      case 'image':
        allowedTypes = ALLOWED_IMAGE_TYPES;
        maxSize = 10 * 1024 * 1024; // 10MB for images
        subPath = `images/${courseId || 'general'}`;
        break;
      case 'video':
        allowedTypes = ALLOWED_VIDEO_TYPES;
        maxSize = 200 * 1024 * 1024; // 200MB for videos
        subPath = `videos/${courseId || 'general'}`;
        break;
      case 'worksheet':
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        maxSize = 20 * 1024 * 1024;
        subPath = `worksheets/${courseId || 'general'}`;
        break;
      case 'rubric':
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        maxSize = 10 * 1024 * 1024;
        subPath = `rubrics/${courseId || 'general'}`;
        break;
      case 'manual':
        allowedTypes = ALLOWED_DOCUMENT_TYPES;
        maxSize = 50 * 1024 * 1024;
        subPath = `manuals/${courseId || 'general'}`;
        break;
      case 'submission':
        allowedTypes = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES];
        maxSize = 50 * 1024 * 1024;
        subPath = `submissions/${courseId || 'general'}`;
        break;
      default:
        subPath = `general/${courseId || 'misc'}`;
    }

    // Handle file upload
    const result = await handleFileUpload(formData, 'file', {
      subPath,
      maxSize,
      allowedTypes
    });

    if (Array.isArray(result)) {
      // Multiple files
      const successCount = result.filter(r => r.success).length;
      const errorCount = result.filter(r => !r.success).length;

      await logActivity(
        session.user.id,
        'file',
        'upload_multiple',
        {
          uploadType,
          courseId,
          resourceType,
          successCount,
          errorCount,
          totalSize: result.reduce((sum, r) => sum + (r.size || 0), 0)
        }
      );

      return NextResponse.json({
        message: `Uploaded ${successCount} files successfully, ${errorCount} failed`,
        results: result
      });
    } else {
      // Single file
      if (result.success) {
        await logActivity(
          session.user.id,
          'file',
          'upload',
          {
            uploadType,
            courseId,
            resourceType,
            filename: result.filename,
            size: result.size,
            url: result.url
          }
        );

        return NextResponse.json({
          message: 'File uploaded successfully',
          file: result
        });
      } else {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
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
    const uploadType = searchParams.get('type');
    const courseId = searchParams.get('course_id');

    // This would typically return a list of uploaded files
    // For now, return upload configuration
    const uploadConfig = {
      types: {
        simulation: {
          allowedTypes: ALLOWED_SIMULATION_TYPES,
          maxSize: 100 * 1024 * 1024,
          description: 'HTML simulations and related files'
        },
        document: {
          allowedTypes: ALLOWED_DOCUMENT_TYPES,
          maxSize: 20 * 1024 * 1024,
          description: 'PDF, Word, Excel documents'
        },
        image: {
          allowedTypes: ALLOWED_IMAGE_TYPES,
          maxSize: 10 * 1024 * 1024,
          description: 'JPEG, PNG, GIF, WebP images'
        },
        video: {
          allowedTypes: ALLOWED_VIDEO_TYPES,
          maxSize: 200 * 1024 * 1024,
          description: 'MP4, WebM, OGG videos'
        },
        worksheet: {
          allowedTypes: ALLOWED_DOCUMENT_TYPES,
          maxSize: 20 * 1024 * 1024,
          description: 'Worksheet documents'
        },
        rubric: {
          allowedTypes: ALLOWED_DOCUMENT_TYPES,
          maxSize: 10 * 1024 * 1024,
          description: 'Grading rubric documents'
        },
        manual: {
          allowedTypes: ALLOWED_DOCUMENT_TYPES,
          maxSize: 50 * 1024 * 1024,
          description: 'Lab manual documents'
        },
        submission: {
          allowedTypes: [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES],
          maxSize: 50 * 1024 * 1024,
          description: 'Student submission files'
        }
      },
      storageType: process.env.STORAGE_TYPE || 'local',
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    };

    return NextResponse.json(uploadConfig);
  } catch (error) {
    console.error('Error getting upload config:', error);
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    );
  }
}