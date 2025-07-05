import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession, createMockStudentSession } from '@/lib/api-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Get student profile data
      const query = `
        SELECT 
          tc.child_id as id,
          tc.child_name,
          tc.date_of_birth,
          tc.sex,
          tc.phone_number,
          tc.father_name,
          tc.father_phone,
          tc.mother_name,
          tc.mother_phone,
          tc.current_address,
          tc.photo_url,
          tc.email,
          ts.school_name,
          tc.grade
        FROM tbl_child tc
        LEFT JOIN tbl_school_list ts ON tc.school_id = ts.school_id
        WHERE tc.child_id = $1
      `;

      const result = await client.query(query, [session.user_id]);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        profile: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    let session = await getAPISession(request);
    
    if (!session && process.env.NODE_ENV === 'development') {
      session = createMockStudentSession();
    }
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Handle photo upload if provided
      let photoUrl = null;
      const photoFile = formData.get('photo') as File;
      
      if (photoFile && photoFile.size > 0) {
        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `student_${session.user_id}_${timestamp}_${photoFile.name}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Set photo URL
        photoUrl = `/uploads/profiles/${filename}`;
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;

      // Map form fields to database columns
      const fieldMap = {
        child_name: 'child_name',
        date_of_birth: 'date_of_birth',
        sex: 'sex',
        phone_number: 'phone_number',
        father_name: 'father_name',
        father_phone: 'father_phone',
        mother_name: 'mother_name',
        mother_phone: 'mother_phone',
        current_address: 'current_address'
      };

      // Add fields to update
      Object.entries(fieldMap).forEach(([formField, dbField]) => {
        const value = formData.get(formField);
        if (value !== null && value !== undefined && value !== '') {
          updates.push(`${dbField} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      // Add photo URL if uploaded
      if (photoUrl) {
        updates.push(`photo_url = $${paramCount}`);
        values.push(photoUrl);
        paramCount++;
      }

      // Add updated timestamp
      updates.push('updated_at = CURRENT_TIMESTAMP');

      // Add student ID at the end
      values.push(session.user_id);

      // Execute update
      const updateQuery = `
        UPDATE tbl_child 
        SET ${updates.join(', ')}
        WHERE child_id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      // Get updated profile with school info
      const profileQuery = `
        SELECT 
          tc.child_id as id,
          tc.child_name,
          tc.date_of_birth,
          tc.sex,
          tc.phone_number,
          tc.father_name,
          tc.father_phone,
          tc.mother_name,
          tc.mother_phone,
          tc.current_address,
          tc.photo_url,
          tc.email,
          ts.school_name,
          tc.grade
        FROM tbl_child tc
        LEFT JOIN tbl_school_list ts ON tc.school_id = ts.school_id
        WHERE tc.child_id = $1
      `;

      const profileResult = await client.query(profileQuery, [session.user_id]);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        profile: profileResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}