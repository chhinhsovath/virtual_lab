import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { pool } from '../../../../lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ColumnInfo = {
  column_name: string;
  data_type: string;
};

type TableColumns = {
  [key: string]: ColumnInfo[];
};

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user session
    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    
    try {
      // Check which tables exist
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      const tablesResult = await client.query(tablesQuery);
      const tables = tablesResult.rows.map(row => row.table_name);

      // Check columns for key tables if they exist
      let tableColumns: TableColumns = {};
      
      const tablesToCheck = ['tarl_assessments', 'tbl_child', 'tbl_teacher_information', 'tbl_school_list', 'tbl_province', 'tarl_student_selection'];
      
      for (const tableName of tablesToCheck) {
        if (tables.includes(tableName)) {
          const columnsQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position
          `;
          
          const columnsResult = await client.query(columnsQuery, [tableName]);
          tableColumns[tableName] = columnsResult.rows;
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          tables,
          tableColumns
        }
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Tables API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}