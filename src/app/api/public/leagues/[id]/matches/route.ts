/**
 * Public league matches API endpoint
 * GET /api/public/leagues/[id]/matches
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicLeagueById } from '@/lib/db/leagues';
import { getPublicLeagueMatches } from '@/lib/db/matches';

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

  // Handle query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    // First check if the league exists and is public
    const league = await getPublicLeagueById(params.id);
    
    if (!league) {
      return NextResponse.json(
        { error: 'League not found or not public' },
        { status: 404 }
      );
    }
    
    // Get matches for the league
    const matches = await getPublicLeagueMatches(params.id);
    
    // Filter by status if provided
    if (status) {
      // Convert single status to array for consistency
      const statusValues = Array.isArray(status) ? status : [status];
      const filteredMatches = matches.filter(match => 
        statusValues.includes(match.status)
      );
      return NextResponse.json(filteredMatches);
    }
    
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error fetching public league matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league matches' },
      { status: 500 }
    );
  }
}
