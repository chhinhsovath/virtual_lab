import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, getAccessibleSchoolIds } from '../../../lib/auth-middleware';
import { logUserActivity } from '../../../lib/auth';
import { pool } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'assessments', 'read');
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { user } = auth;
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const subject = searchParams.get('subject');
    const cycle = searchParams.get('cycle');

    // Get accessible schools for this user
    const accessibleSchoolIds = getAccessibleSchoolIds(user, 'read');
    
    if (accessibleSchoolIds.length === 0) {
      return NextResponse.json({ assessments: [] });
    }

    // Build query based on user permissions
    let query = `
      SELECT 
        ta.id,
        ta."studentId",
        ta."teacherId", 
        ta."schoolId",
        ta.subject,
        ta."assessmentCycle" as cycle,
        ta."levelAchieved" as level_achieved,
        ta."assessmentDate" as assessment_date,
        ta.created_at,
        tc."chiFirstName" as student_first_name,
        tc."chiLastName" as student_last_name,
        tc."chiGender" as student_gender,
        tc."chiGrade" as student_grade,
        tt."teiFirstName" as teacher_first_name,
        tt."teiLastName" as teacher_last_name,
        ts."sclSchoolNameEN" as school_name
      FROM tarl_assessments ta
      JOIN tbl_child tc ON ta."studentId" = tc."chiID"
      JOIN tbl_teacher_information tt ON ta."teacherId" = tt."teiAutoID"
      JOIN tbl_school_list ts ON ta."schoolId" = ts."sclAutoID"
      WHERE ta."schoolId" = ANY($1)
    `;
    const params: any[] = [accessibleSchoolIds];
    let paramCount = 1;

    // Additional filters
    if (schoolId) {
      const schoolIdNum = parseInt(schoolId);
      if (accessibleSchoolIds.includes(schoolIdNum)) {
        paramCount++;
        query += ` AND ta."schoolId" = $${paramCount}`;
        params.push(schoolIdNum);
      } else {
        return NextResponse.json(
          { error: 'Access denied to this school' },
          { status: 403 }
        );
      }
    }

    if (subject) {
      paramCount++;
      query += ` AND ta.subject = $${paramCount}`;
      params.push(subject);
    }

    if (cycle) {
      paramCount++;
      query += ` AND ta."assessmentCycle" = $${paramCount}`;
      params.push(cycle);
    }

    query += ' ORDER BY ta."assessmentDate" DESC, ta.created_at DESC';

    const result = await pool.query(query, params);

    return NextResponse.json({
      assessments: result.rows,
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission(request, 'assessments', 'create');
    
    if (auth instanceof NextResponse) {
      return auth;
    }

    const { user } = auth;
    const {
      studentId,
      teacherId,
      schoolId,
      subject,
      cycle,
      levelAchieved,
      assessmentDate,
      notes,
    } = await request.json();

    // Validate required fields
    if (!studentId || !teacherId || !schoolId || !subject || !cycle || !levelAchieved || !assessmentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has write access to this school
    const accessibleSchoolIds = getAccessibleSchoolIds(user, 'write');
    if (!accessibleSchoolIds.includes(schoolId)) {
      return NextResponse.json(
        { error: 'Access denied to this school' },
        { status: 403 }
      );
    }

    // Insert assessment
    const result = await pool.query(`
      INSERT INTO tarl_assessments 
      ("studentId", "teacherId", "schoolId", subject, "assessmentCycle", "levelAchieved", "assessmentDate")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [studentId, teacherId, schoolId, subject, cycle, levelAchieved, assessmentDate]);

    // Log activity
    await logUserActivity(
      user.id,
      'create',
      'assessment',
      result.rows[0].id,
      { studentId, schoolId, subject, cycle, levelAchieved }
    );

    return NextResponse.json({
      success: true,
      assessment: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}