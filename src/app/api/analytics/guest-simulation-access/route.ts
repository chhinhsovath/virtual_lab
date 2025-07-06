import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { guestId, simulationCount, timestamp } = await request.json();
    
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIP || 'unknown';

    // Log guest simulation access for analytics
    await logger.logGuestAction('simulation_accessed', {
      guestId,
      simulationCount,
      timestamp,
      isRecurringAccess: simulationCount > 1
    }, guestId);

    // Track user journey based on simulation count
    if (simulationCount === 1) {
      await logger.logUserJourney('first_simulation_access', 'guest', {
        guestId,
        timestamp
      });
    } else if (simulationCount >= 2) {
      await logger.logUserJourney('multiple_simulation_attempts', 'guest', {
        guestId,
        simulationCount,
        shouldPromptEnrollment: simulationCount >= 1,
        timestamp
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await logger.error('Guest analytics logging failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: false, error: 'Analytics logging failed' }, { status: 200 });
  }
}