import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Check what tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'stem_simulations_catalog',
        'student_simulation_progress',
        'student_exercise_submissions',
        'student_achievements',
        'simulation_exercises'
      )
      ORDER BY table_name
    `);
    
    // Check columns for stem_simulations_catalog
    const catalogColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'stem_simulations_catalog'
      ORDER BY ordinal_position
    `);
    
    // Check columns for student_simulation_progress
    const progressColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'student_simulation_progress'
      ORDER BY ordinal_position
    `);
    
    // Try a simple query on stem_simulations_catalog
    let simulations = [];
    try {
      const simResult = await client.query(`
        SELECT id, display_name_en, display_name_km, is_active
        FROM stem_simulations_catalog
        WHERE is_active = true
        LIMIT 5
      `);
      simulations = simResult.rows;
    } catch (e: any) {
      simulations = [{ error: e.message }];
    }
    
    return NextResponse.json({
      success: true,
      tables: tablesResult.rows,
      catalogColumns: catalogColumnsResult.rows,
      progressColumns: progressColumnsResult.rows,
      sampleSimulations: simulations,
      message: 'Database structure check'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail
    }, { status: 500 });
  } finally {
    client.release();
  }
}