import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// This API updates the pendulum lab simulation URL to point to the HTML file
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Update the pendulum lab simulation URL
    const result = await client.query(`
      UPDATE stem_simulations_catalog 
      SET simulation_url = '/simulation_pendulum_lab_km.html'
      WHERE simulation_name = 'pendulum-lab'
      RETURNING id, simulation_name, display_name_en, display_name_km, simulation_url
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pendulum lab simulation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      simulation: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating simulation URL:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation URL', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}