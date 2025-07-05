import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getAPISession } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAPISession(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Check table structure
      const tableStructureQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'student_simulation_progress' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const tableStructure = await client.query(tableStructureQuery);

      // Check if any records exist
      const countQuery = `
        SELECT COUNT(*) as total_records 
        FROM student_simulation_progress;
      `;
      
      const countResult = await client.query(countQuery);

      // Check stem_simulations_catalog
      const catalogQuery = `
        SELECT COUNT(*) as total_simulations 
        FROM stem_simulations_catalog 
        WHERE is_active = true;
      `;
      
      const catalogResult = await client.query(catalogQuery);

      // Try to get sample data
      let sampleData = null;
      try {
        const sampleQuery = `
          SELECT * FROM student_simulation_progress 
          LIMIT 5;
        `;
        const sampleResult = await client.query(sampleQuery);
        sampleData = sampleResult.rows;
      } catch (err: any) {
        sampleData = { error: err.message };
      }

      // Check which columns exist
      const columnCheckQuery = `
        SELECT 
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'completed') as has_completed,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'completed_at') as has_completed_at,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'time_spent') as has_time_spent,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'total_time_spent') as has_total_time_spent,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'student_uuid') as has_student_uuid,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'progress_percentage') as has_progress_percentage,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_simulation_progress' AND column_name = 'current_progress') as has_current_progress
      `;
      
      const columnCheck = await client.query(columnCheckQuery);

      return NextResponse.json({
        success: true,
        debug_info: {
          session: {
            user_id: session.user_id,
            user_uuid: session.user_uuid,
            role: session.user.role_name
          },
          table_structure: tableStructure.rows,
          total_records: countResult.rows[0].total_records,
          total_simulations: catalogResult.rows[0].total_simulations,
          sample_data: sampleData,
          column_check: columnCheck.rows[0]
        }
      });
      
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
}