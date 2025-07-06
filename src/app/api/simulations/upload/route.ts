import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Ensure upload directory exists
async function ensureUploadDir(subPath: string) {
  const fullPath = path.join(UPLOAD_DIR, subPath);
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true });
  }
  return fullPath;
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${safeName}_${timestamp}_${random}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is teacher or admin
    if (!['teacher', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    // Validate file type based on upload type
    let allowedTypes: string[] = [];
    let subPath = '';

    switch (type) {
      case 'simulation':
        allowedTypes = ['text/html', 'application/xhtml+xml'];
        subPath = 'simulations';
        // Also check file extension
        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
          return NextResponse.json({ 
            error: 'Simulation files must be HTML files' 
          }, { status: 400 });
        }
        break;
      
      case 'image':
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        subPath = 'images';
        break;
      
      default:
        return NextResponse.json({ 
          error: 'Invalid upload type' 
        }, { status: 400 });
    }

    // Validate MIME type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Ensure upload directory exists
    const uploadPath = await ensureUploadDir(subPath);

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(uploadPath, uniqueFilename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write file to disk
    await writeFile(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/${subPath}/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        filename: uniqueFilename,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload configuration
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      maxFileSize: MAX_FILE_SIZE,
      allowedTypes: {
        simulation: {
          mimeTypes: ['text/html', 'application/xhtml+xml'],
          extensions: ['.html', '.htm'],
          maxSize: MAX_FILE_SIZE
        },
        image: {
          mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
          maxSize: 10 * 1024 * 1024 // 10MB for images
        }
      }
    });
  } catch (error) {
    console.error('Error getting upload config:', error);
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    );
  }
}