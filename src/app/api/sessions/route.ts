import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSessions } from '@/app/actions';

export async function POST(request: Request) {
  try {
    const { date, coachId, branchId, level } = await request.json();

    if (!date || !coachId || !branchId || !level) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sessions = await getAvailableSessions(date, coachId, branchId, level);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
} 