import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }
    
    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has student role
    if (!session.user.roles?.includes('student')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const client = await pool.connect();
    
    try {
      // Use correct table structure for TaRL system
      const query = `
        SELECT 
          "chiID" as id,
          "chiFirstName" || ' ' || "chiLastName" as child_name,
          "chiDOB" as date_of_birth,
          "chiGender" as sex,
          NULL as phone_number,
          "chiFatherName" as father_name,
          NULL as father_phone,
          "chiMotherName" as mother_name,
          NULL as mother_phone,
          "chiAddress" as current_address,
          NULL as photo_url,
          NULL as email,
          ts."sclSchoolNameEN" as school_name,
          "chiGrade" as grade
        FROM tbl_child tc
        LEFT JOIN tbl_school_list ts ON tc."chiSchoolId" = ts."sclAutoID"
        WHERE tc."chiID" = $1
      `;

      const result = await client.query(query, [session.user.id]);

      if (result.rows.length === 0) {
        // Return mock profile for development
        const mockProfile = {
          id: session.user.id,
          child_name: session.user.firstName + ' ' + session.user.lastName,
          date_of_birth: '2010-01-01',
          sex: 'Male',
          phone_number: null,
          father_name: 'Mock Father',
          father_phone: null,
          mother_name: 'Mock Mother',
          mother_phone: null,
          current_address: 'Phnom Penh, Cambodia',
          photo_url: null,
          email: session.user.email,
          school_name: 'Sample School',
          grade: 'Grade 10'
        };
        
        return NextResponse.json({
          success: true,
          profile: mockProfile
        });
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
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }
    
    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has student role
    if (!session.user.roles?.includes('student')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
        const filename = `student_${session.user.id}_${timestamp}_${photoFile.name}`;
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
      values.push(session.user.id);

      // Execute update using correct table structure
      const updateQuery = `
        UPDATE tbl_child 
        SET ${updates.join(', ')}
        WHERE "chiID" = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      // Get updated profile with school info
      const profileQuery = `
        SELECT 
          "chiID" as id,
          "chiFirstName" || ' ' || "chiLastName" as child_name,
          "chiDOB" as date_of_birth,
          "chiGender" as sex,
          NULL as phone_number,
          "chiFatherName" as father_name,
          NULL as father_phone,
          "chiMotherName" as mother_name,
          NULL as mother_phone,
          "chiAddress" as current_address,
          NULL as photo_url,
          NULL as email,
          ts."sclSchoolNameEN" as school_name,
          "chiGrade" as grade
        FROM tbl_child tc
        LEFT JOIN tbl_school_list ts ON tc."chiSchoolId" = ts."sclAutoID"
        WHERE tc."chiID" = $1
      `;

      const profileResult = await client.query(profileQuery, [session.user.id]);

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