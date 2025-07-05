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
    
    if (!['fix_student_id_types', 'create_missing_tables'].includes(migration)) {
      return NextResponse.json({ error: 'Invalid migration name' }, { status: 400 });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      if (migration === 'create_missing_tables') {
        // Run the comprehensive migration
        const migrationResults: any[] = [];
        
        try {
          // Create student_assignment_submissions table
          await client.query(`
            CREATE TABLE IF NOT EXISTS student_assignment_submissions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              assignment_id UUID,
              student_id INTEGER,
              student_uuid UUID,
              score DECIMAL(5,2),
              submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              status VARCHAR(50) DEFAULT 'pending',
              feedback TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `);
          migrationResults.push({ action: 'Created student_assignment_submissions table', status: 'success' });
        } catch (e: any) {
          migrationResults.push({ action: 'Create student_assignment_submissions', status: 'error', error: e.message });
        }
        
        // Add metadata column to teacher_simulation_assignments
        try {
          const metadataExists = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'teacher_simulation_assignments' 
            AND column_name = 'metadata'
          `);
          
          if (metadataExists.rows.length === 0) {
            await client.query(`
              ALTER TABLE teacher_simulation_assignments 
              ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb
            `);
            migrationResults.push({ action: 'Added metadata column to teacher_simulation_assignments', status: 'success' });
          } else {
            migrationResults.push({ action: 'metadata column already exists', status: 'skipped' });
          }
        } catch (e: any) {
          migrationResults.push({ action: 'Add metadata column', status: 'error', error: e.message });
        }
        
        await client.query('COMMIT');
        
        return NextResponse.json({
          success: true,
          message: 'Missing tables migration completed',
          results: migrationResults
        });
      }

      // Original fix_student_id_types migration
      // First check which tables exist
      const tableCheckResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('student_simulation_progress', 'student_exercise_submissions', 'student_achievements')
      `);
      
      const existingTables = tableCheckResult.rows.map(row => row.table_name);
      const results: any[] = [];
      
      // Process each table that exists
      for (const tableName of existingTables) {
        try {
          // Check if student_uuid column already exists
          const columnExists = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = 'student_uuid'
          `, [tableName]);
          
          if (columnExists.rows.length === 0) {
            // Add student_uuid column
            await client.query(`ALTER TABLE ${tableName} ADD COLUMN student_uuid UUID`);
            results.push({ table: tableName, action: 'added student_uuid column', status: 'success' });
          } else {
            results.push({ table: tableName, action: 'student_uuid column already exists', status: 'skipped' });
          }
          
          // Check if student_id is NOT NULL
          const nullableCheck = await client.query(`
            SELECT is_nullable FROM information_schema.columns 
            WHERE table_name = $1 AND column_name = 'student_id'
          `, [tableName]);
          
          if (nullableCheck.rows.length > 0 && nullableCheck.rows[0].is_nullable === 'NO') {
            await client.query(`ALTER TABLE ${tableName} ALTER COLUMN student_id DROP NOT NULL`);
            results.push({ table: tableName, action: 'made student_id nullable', status: 'success' });
          }
          
          // Try to create index
          try {
            await client.query(`CREATE INDEX idx_${tableName}_student_uuid ON ${tableName}(student_uuid)`);
            results.push({ table: tableName, action: 'created index on student_uuid', status: 'success' });
          } catch (indexError: any) {
            if (indexError.code === '42P07') { // duplicate_table
              results.push({ table: tableName, action: 'index already exists', status: 'skipped' });
            } else {
              results.push({ table: tableName, action: 'index creation failed', status: 'error', error: indexError.message });
            }
          }
          
        } catch (tableError: any) {
          results.push({ table: tableName, action: 'migration failed', status: 'error', error: tableError.message });
        }
      }
      
      // If no tables exist, report that
      if (existingTables.length === 0) {
        results.push({ action: 'No student tables found', status: 'warning' });
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
        results,
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