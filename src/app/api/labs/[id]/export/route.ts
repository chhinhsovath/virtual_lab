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
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv'; // csv or pdf
    const includeResponses = searchParams.get('include_responses') === 'true';
    const includeComments = searchParams.get('include_comments') === 'true';

    // Check permissions - only teachers and admins can export
    const canExport = await hasLMSPermission(session.user.id, 'assessments', 'read');
    if (!canExport) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();

    try {
      // Verify lab exists and user has access
      const labResult = await client.query(
        'SELECT l.*, c.id as course_id, c.name as course_name FROM lms_labs l LEFT JOIN lms_courses c ON l.course_id = c.id WHERE l.id = $1',
        [labId]
      );

      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found' }, { status: 404 });
      }

      const lab = labResult.rows[0];
      
      // Check course access
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (format === 'csv') {
        // Generate CSV export
        const csvData = await generateCSVExport(client, labId, includeResponses, includeComments);
        
        await logActivity(
          session.user.id,
          'lab_export',
          'csv',
          {
            labId,
            labTitle: lab.title,
            includeResponses,
            includeComments,
            recordCount: csvData.split('\n').length - 1
          },
          'labs',
          labId
        );

        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="lab_${lab.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.csv"`
          }
        });

      } else if (format === 'pdf') {
        // Generate PDF export
        const pdfData = await generatePDFExport(client, lab, includeResponses, includeComments);
        
        await logActivity(
          session.user.id,
          'lab_export',
          'pdf',
          {
            labId,
            labTitle: lab.title,
            includeResponses,
            includeComments
          },
          'labs',
          labId
        );

        return new NextResponse(pdfData, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="lab_${lab.title.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf"`
          }
        });

      } else {
        return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 });
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

async function generateCSVExport(
  client: any,
  labId: string,
  includeResponses: boolean,
  includeComments: boolean
): Promise<string> {
  
  // Get export data
  const exportResult = await client.query(
    `SELECT * FROM lab_export_data WHERE lab_id = $1 ORDER BY student_name`,
    [labId]
  );

  if (exportResult.rows.length === 0) {
    return 'No data available for export';
  }

  const rows = exportResult.rows;
  
  // Build CSV headers
  let headers = [
    'Student Name',
    'Student Email',
    'Final Score',
    'Auto Score',
    'Manual Score',
    'Percentage',
    'Letter Grade',
    'Duration (minutes)',
    'Submitted At',
    'Graded At',
    'Graded By',
    'Session Status'
  ];

  if (includeComments) {
    headers.push('Teacher Comments');
  }

  if (includeResponses) {
    // Get a sample submission to determine response fields
    const sampleResult = await client.query(
      `SELECT lsub.responses 
       FROM lab_submissions lsub
       JOIN lab_sessions lsess ON lsub.session_id = lsess.id
       WHERE lsess.lab_id = $1 AND lsub.responses IS NOT NULL
       LIMIT 1`,
      [labId]
    );

    if (sampleResult.rows.length > 0 && sampleResult.rows[0].responses) {
      const sampleResponses = sampleResult.rows[0].responses;
      Object.keys(sampleResponses).forEach(key => {
        headers.push(`Response: ${key}`);
      });
    }
  }

  // Build CSV content
  let csvContent = headers.join(',') + '\n';

  for (const row of rows) {
    let csvRow = [
      escapeCsvValue(row.student_name || ''),
      escapeCsvValue(row.student_email || ''),
      row.final_score || '',
      row.auto_score || '',
      row.manual_score || '',
      row.percentage_score ? Math.round(row.percentage_score * 10) / 10 : '',
      row.letter_grade || '',
      row.duration_minutes || '',
      row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '',
      row.graded_at ? new Date(row.graded_at).toLocaleString() : '',
      escapeCsvValue(row.graded_by || ''),
      row.session_status || ''
    ];

    if (includeComments) {
      csvRow.push(escapeCsvValue(row.teacher_comments || ''));
    }

    if (includeResponses) {
      // Get student's responses
      const responseResult = await client.query(
        `SELECT lsub.responses 
         FROM lab_submissions lsub
         JOIN lab_sessions lsess ON lsub.session_id = lsess.id
         WHERE lsess.lab_id = $1 AND lsub.student_id = $2`,
        [labId, row.student_id]
      );

      const responses = responseResult.rows[0]?.responses || {};
      
      // Add response values in the same order as headers
      Object.keys(responses).forEach(key => {
        csvRow.push(escapeCsvValue(String(responses[key] || '')));
      });
    }

    csvContent += csvRow.join(',') + '\n';
  }

  return csvContent;
}

async function generatePDFExport(
  client: any,
  lab: any,
  includeResponses: boolean,
  includeComments: boolean
): Promise<Buffer> {
  
  // Get analytics data
  const analyticsResult = await client.query(
    'SELECT * FROM lab_teacher_analytics WHERE lab_id = $1',
    [lab.id]
  );

  const analytics = analyticsResult.rows[0] || {};

  // Get student data
  const studentsResult = await client.query(
    `SELECT * FROM lab_export_data WHERE lab_id = $1 ORDER BY student_name`,
    [lab.id]
  );

  // Simple PDF generation (in a real app, you'd use a proper PDF library like puppeteer or jsPDF)
  // For now, we'll return a simple text-based "PDF" as demonstration
  const pdfContent = generatePDFContent(lab, analytics, studentsResult.rows, includeResponses, includeComments);
  
  return Buffer.from(pdfContent, 'utf-8');
}

function generatePDFContent(
  lab: any,
  analytics: any,
  students: any[],
  includeResponses: boolean,
  includeComments: boolean
): string {
  
  const now = new Date().toLocaleString();
  
  let content = `
LAB PERFORMANCE REPORT
======================

Lab: ${lab.title}
Subject: ${lab.subject}
Grade: ${lab.grade}
Course: ${lab.course_name}
Generated: ${now}

SUMMARY STATISTICS
==================
Total Students Attempted: ${analytics.total_students_attempted || 0}
Total Submissions: ${analytics.total_submissions || 0}
Completed Submissions: ${analytics.completed_submissions || 0}
Submission Rate: ${analytics.submission_rate_percentage || 0}%
Average Score: ${analytics.avg_score ? Math.round(analytics.avg_score * 10) / 10 : 'N/A'}
Average Time: ${analytics.avg_time_minutes ? Math.round(analytics.avg_time_minutes) + ' minutes' : 'N/A'}

GRADE DISTRIBUTION
==================
A (90-100%): ${analytics.grade_a_count || 0} students
B (80-89%):  ${analytics.grade_b_count || 0} students
C (70-79%):  ${analytics.grade_c_count || 0} students
D (60-69%):  ${analytics.grade_d_count || 0} students
F (<60%):    ${analytics.grade_f_count || 0} students

STUDENT PERFORMANCE
===================
`;

  students.forEach((student, index) => {
    content += `
${index + 1}. ${student.student_name}
   Email: ${student.student_email}
   Final Score: ${student.final_score || 'Not scored'}
   Percentage: ${student.percentage_score ? Math.round(student.percentage_score * 10) / 10 + '%' : 'N/A'}
   Letter Grade: ${student.letter_grade || 'N/A'}
   Time Spent: ${student.duration_minutes ? student.duration_minutes + ' minutes' : 'N/A'}
   Submitted: ${student.submitted_at ? new Date(student.submitted_at).toLocaleString() : 'Not submitted'}
   Status: ${student.session_status || 'Unknown'}
`;

    if (includeComments && student.teacher_comments) {
      content += `   Comments: ${student.teacher_comments}\n`;
    }
  });

  content += `

---
Report generated by Virtual Lab LMS
${now}
`;

  return content;
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}