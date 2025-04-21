/**
 * Public league details API endpoint
 * GET /api/public/leagues/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicLeagueById } from '@/lib/db/leagues';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Input validation
  if (!params.id || !params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return NextResponse.json(
      { error: 'Invalid league ID format' },
      { status: 400 }
    );
  }

  try {
    const league = await getPublicLeagueById(params.id);
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found or not public' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(league);
  } catch (error) {
    console.error('Error fetching public league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league data' },
      { status: 500 }
    );
  }
}
