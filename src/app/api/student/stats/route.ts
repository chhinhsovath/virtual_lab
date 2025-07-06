import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }
    
    const session = await getSession(sessionToken);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has student role
    if (!session.user.roles?.includes('student')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Return mock data for now - replace with actual database queries when tables are ready
    const mockStats = {
      total_simulations: 15,
      completed_simulations: 12,
      average_score: 85.5,
      total_time: 1250, // minutes
      total_achievements: 8,
      total_points: 450,
      by_subject: {
        'Physics': { total: 4, completed: 3, avg_score: 88, total_time: 320 },
        'Chemistry': { total: 3, completed: 3, avg_score: 82, total_time: 280 },
        'Biology': { total: 4, completed: 3, avg_score: 87, total_time: 350 },
        'Mathematics': { total: 4, completed: 3, avg_score: 85, total_time: 300 }
      },
      recent_activity: [
        {
          simulation_id: 'sim-001',
          display_name_en: 'Physics Pendulum Lab',
          display_name_km: 'មន្ទីរពិសោធន៍រូម៉ង់',
          subject_area: 'Physics',
          progress_percentage: 100,
          last_accessed: new Date().toISOString()
        },
        {
          simulation_id: 'sim-002', 
          display_name_en: 'Chemical Reactions',
          display_name_km: 'ប្រតិកម្មគីមី',
          subject_area: 'Chemistry',
          progress_percentage: 75,
          last_accessed: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };

    return NextResponse.json({
      success: true,
      stats: mockStats
    });

  } catch (error) {
    console.error('Student stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student statistics' },
      { status: 500 }
    );
  }
}