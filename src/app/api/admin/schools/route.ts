import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { withSuperAdmin } from '@/lib/super-admin-api';
import { activityLogger } from '@/lib/activity-logger';

export const GET = withSuperAdmin(async (request: NextRequest) => {
  const client = await pool.connect();
  
  try {
    // Get all schools with statistics
    const schoolsQuery = `
      SELECT 
        s.school_id,
        s.school_code,
        s.school_name,
        s.school_name_en,
        s.province_id,
        p.name_en as province_name,
        s.district,
        s.commune,
        s.village,
        s.phone,
        s.email,
        s.created_at,
        -- Count teachers
        (SELECT COUNT(DISTINCT u.id) 
         FROM users u
         JOIN user_school_access usa ON u.id = usa.user_id
         WHERE usa.school_id = s.school_id 
         AND u.role = 'teacher'
         AND u.is_active = true) as teacher_count,
        -- Count students  
        (SELECT COUNT(DISTINCT u.id)
         FROM users u
         JOIN user_school_access usa ON u.id = usa.user_id
         WHERE usa.school_id = s.school_id
         AND u.role = 'student'
         AND u.is_active = true) as student_count,
        -- Count active simulations
        (SELECT COUNT(DISTINCT simulation_id)
         FROM student_submissions
         WHERE school_id = s.school_id
         AND created_at > NOW() - INTERVAL '30 days') as active_simulations
      FROM tbl_school_list s
      LEFT JOIN tbl_province p ON s.province_id::text = p.id::text
      ORDER BY s.school_name ASC
    `;

    const schoolsResult = await client.query(schoolsQuery);

    // Get summary statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT s.school_id) as total_schools,
        COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN u.id END) as total_teachers,
        COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as total_students,
        COUNT(DISTINCT ss.simulation_id) as total_simulations
      FROM tbl_school_list s
      LEFT JOIN user_school_access usa ON s.school_id = usa.school_id
      LEFT JOIN users u ON usa.user_id = u.id AND u.is_active = true
      LEFT JOIN student_submissions ss ON s.school_id = ss.school_id
        AND ss.created_at > NOW() - INTERVAL '30 days'
    `;

    const statsResult = await client.query(statsQuery);

    return NextResponse.json({
      success: true,
      schools: schoolsResult.rows,
      stats: statsResult.rows[0]
    });

  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schools data' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
});

export const POST = withSuperAdmin(async (request: NextRequest) => {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    const {
      school_code,
      school_name,
      school_name_en,
      province_id,
      district,
      commune,
      village,
      phone,
      email
    } = body;

    // Validate required fields
    if (!school_code || !school_name || !province_id) {
      return NextResponse.json(
        { error: 'School code, name, and province are required' },
        { status: 400 }
      );
    }

    // Check if school code already exists
    const existingQuery = 'SELECT school_id FROM tbl_school_list WHERE school_code = $1';
    const existingResult = await client.query(existingQuery, [school_code]);
    
    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'School code already exists' },
        { status: 400 }
      );
    }

    // Insert new school
    const insertQuery = `
      INSERT INTO tbl_school_list (
        school_code,
        school_name,
        school_name_en,
        province_id,
        district,
        commune,
        village,
        phone,
        email,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `;

    const values = [
      school_code,
      school_name,
      school_name_en || null,
      province_id,
      district || null,
      commune || null,
      village || null,
      phone || null,
      email || null
    ];

    const result = await client.query(insertQuery, values);

    // Log activity
    await activityLogger.logUserAction(
      'school.create',
      request.headers.get('x-user-id') || 'system',
      'school',
      result.rows[0].school_id,
      { school_code, school_name }
    );

    return NextResponse.json({
      success: true,
      school: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
});