import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../lib/db';
import { getLMSSession, canAccessCourse, logActivity } from '../../../../../lib/lms-auth';

// Mock DOCX parser - in production, you'd use a library like mammoth.js or docx-parser
interface WorksheetField {
  id: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface WorksheetSchema {
  title: string;
  description: string;
  sections: {
    title: string;
    fields: WorksheetField[];
  }[];
}

// Mock function to parse DOCX worksheet into form schema
// In production, this would parse the actual DOCX file
function parseWorksheetToSchema(worksheetUrl: string, labTitle: string): WorksheetSchema {
  // This is a mock implementation - replace with actual DOCX parsing
  return {
    title: `${labTitle} - Worksheet`,
    description: 'Complete the following questions based on your lab observations.',
    sections: [
      {
        title: 'Pre-Lab Questions',
        fields: [
          {
            id: 'hypothesis',
            type: 'textarea',
            label: 'State your hypothesis for this experiment',
            placeholder: 'Based on your understanding, what do you expect to observe?',
            required: true
          },
          {
            id: 'equipment',
            type: 'text',
            label: 'List the equipment you will use',
            placeholder: 'e.g., pendulum, stopwatch, ruler',
            required: true
          }
        ]
      },
      {
        title: 'Observations',
        fields: [
          {
            id: 'trial_1_time',
            type: 'number',
            label: 'Trial 1 - Time (seconds)',
            placeholder: '0.00',
            required: true,
            validation: { min: 0, max: 300 }
          },
          {
            id: 'trial_2_time',
            type: 'number',
            label: 'Trial 2 - Time (seconds)',
            placeholder: '0.00',
            required: true,
            validation: { min: 0, max: 300 }
          },
          {
            id: 'trial_3_time',
            type: 'number',
            label: 'Trial 3 - Time (seconds)',
            placeholder: '0.00',
            required: true,
            validation: { min: 0, max: 300 }
          },
          {
            id: 'observations',
            type: 'textarea',
            label: 'Record your detailed observations',
            placeholder: 'Describe what you observed during the experiment...',
            required: true
          }
        ]
      },
      {
        title: 'Analysis',
        fields: [
          {
            id: 'average_time',
            type: 'number',
            label: 'Calculate the average time',
            placeholder: '0.00',
            required: true,
            validation: { min: 0, max: 300 }
          },
          {
            id: 'pattern_observed',
            type: 'select',
            label: 'What pattern did you observe?',
            required: true,
            options: [
              'Time increases with length',
              'Time decreases with length',
              'Time remains constant',
              'No clear pattern'
            ]
          },
          {
            id: 'conclusion',
            type: 'textarea',
            label: 'Write your conclusion',
            placeholder: 'Based on your observations and analysis...',
            required: true
          }
        ]
      },
      {
        title: 'Reflection',
        fields: [
          {
            id: 'hypothesis_correct',
            type: 'radio',
            label: 'Was your hypothesis correct?',
            required: true,
            options: ['Yes', 'Partially', 'No']
          },
          {
            id: 'challenges',
            type: 'textarea',
            label: 'What challenges did you face during this lab?',
            placeholder: 'Describe any difficulties or unexpected results...',
            required: false
          },
          {
            id: 'learned',
            type: 'textarea',
            label: 'What did you learn from this experiment?',
            placeholder: 'Explain the key concepts you learned...',
            required: true
          }
        ]
      }
    ]
  };
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
      // Get lab details and check if student has access
      const labQuery = `
        SELECT 
          l.*,
          c.id as course_id,
          c.title as course_title,
          lr.file_url as worksheet_url
        FROM lms_labs l
        LEFT JOIN lms_courses c ON l.course_id = c.id
        LEFT JOIN lms_lab_resources lr ON l.id = lr.lab_id AND lr.resource_type = 'worksheet'
        WHERE l.id = $1 AND l.is_published = true
      `;

      const labResult = await client.query(labQuery, [labId]);
      if (labResult.rows.length === 0) {
        return NextResponse.json({ error: 'Lab not found or not published' }, { status: 404 });
      }

      const lab = labResult.rows[0];

      // Check if student can access this lab
      const canAccess = await canAccessCourse(session.user.id, lab.course_id, 'read');
      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Check if student is enrolled in the course
      const enrollmentResult = await client.query(
        'SELECT id FROM lms_course_enrollments WHERE course_id = $1 AND student_id = $2 AND status = $3',
        [lab.course_id, session.user.id, 'enrolled']
      );

      if (enrollmentResult.rows.length === 0) {
        return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 });
      }

      // Get or create current session
      const sessionResult = await client.query(
        `SELECT id, status, start_time FROM lab_sessions 
         WHERE lab_id = $1 AND student_id = $2 AND status = 'in_progress'
         ORDER BY start_time DESC LIMIT 1`,
        [labId, session.user.id]
      );

      let currentSession = null;
      if (sessionResult.rows.length > 0) {
        currentSession = sessionResult.rows[0];
      }

      // Get any existing submission data
      let existingData = null;
      if (currentSession) {
        const submissionResult = await client.query(
          'SELECT responses, autosave_data FROM lab_submissions WHERE session_id = $1',
          [currentSession.id]
        );
        
        if (submissionResult.rows.length > 0) {
          const submission = submissionResult.rows[0];
          existingData = submission.autosave_data || submission.responses;
        }
      }

      // Parse worksheet to form schema
      const worksheetSchema = parseWorksheetToSchema(
        lab.worksheet_url || '',
        lab.title
      );

      await logActivity(
        session.user.id,
        'lab_form',
        'view',
        { labId, sessionId: currentSession?.id },
        'labs',
        labId
      );

      return NextResponse.json({
        lab: {
          id: lab.id,
          title: lab.title,
          description: lab.description,
          subject: lab.subject,
          grade: lab.grade,
          duration_minutes: lab.duration_minutes
        },
        worksheetSchema,
        currentSession,
        existingData
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting lab form:', error);
    return NextResponse.json(
      { error: 'Failed to load lab form' },
      { status: 500 }
    );
  }
}