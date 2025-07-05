import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession } from '@/lib/auth';

// IMPORTANT: This endpoint should be secured and only accessible by admins
// Consider adding additional security measures like a secret token

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await getSession(sessionToken);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get migration name from request
    const { migration } = await request.json();
    
    if (migration !== 'fix_student_id_types') {
      return NextResponse.json({ error: 'Invalid migration name' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Run the migration
      const migrationQueries = [
        // Add student_uuid columns
        `ALTER TABLE student_simulation_progress ADD COLUMN IF NOT EXISTS student_uuid UUID`,
        `ALTER TABLE student_exercise_submissions ADD COLUMN IF NOT EXISTS student_uuid UUID`,
        `ALTER TABLE student_achievements ADD COLUMN IF NOT EXISTS student_uuid UUID`,
        
        // Make student_id nullable
        `ALTER TABLE student_simulation_progress ALTER COLUMN student_id DROP NOT NULL`,
        `ALTER TABLE student_exercise_submissions ALTER COLUMN student_id DROP NOT NULL`,
        `ALTER TABLE student_achievements ALTER COLUMN student_id DROP NOT NULL`,
        
        // Create indexes
        `CREATE INDEX IF NOT EXISTS idx_student_simulation_progress_student_uuid ON student_simulation_progress(student_uuid)`,
        `CREATE INDEX IF NOT EXISTS idx_student_exercise_submissions_student_uuid ON student_exercise_submissions(student_uuid)`,
        `CREATE INDEX IF NOT EXISTS idx_student_achievements_student_uuid ON student_achievements(student_uuid)`
      ];

      for (const query of migrationQueries) {
        try {
          await client.query(query);
        } catch (error: any) {
          // Ignore errors for operations that might already exist
          console.log(`Migration step warning: ${error.message}`);
        }
      }

      await client.query('COMMIT');

      // Verify the changes
      const verificationResult = await client.query(`
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_name IN ('student_simulation_progress', 'student_exercise_submissions', 'student_achievements')
        AND column_name IN ('student_id', 'student_uuid')
        ORDER BY table_name, column_name
      `);

      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully',
        verification: verificationResult.rows
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
}