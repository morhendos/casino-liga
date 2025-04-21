/**
 * Public league rankings API endpoint
 * GET /api/public/leagues/[id]/rankings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicLeagueById } from '@/lib/db/leagues';
import { getPublicLeagueRankings } from '@/lib/db/rankings';

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
    // First check if the league exists and is public
    const league = await getPublicLeagueById(params.id);
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found or not public' },
        { status: 404 }
      );
    }
    
    // Get rankings for the league
    const rankings = await getPublicLeagueRankings(params.id);
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error fetching public league rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league rankings' },
      { status: 500 }
    );
  }
}
