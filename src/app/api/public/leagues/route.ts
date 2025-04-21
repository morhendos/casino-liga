/**
 * Public leagues directory API endpoint
 * GET /api/public/leagues
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPublicLeagues } from '@/lib/db/leagues';

export async function GET(request: NextRequest) {
  // Handle query parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  try {
    // Get all public leagues
    let leagues = await getPublicLeagues();
    
    // Filter by status if provided
    if (status) {
      // Convert single status to array for consistency
      const statusValues = status.split(',');
      leagues = leagues.filter(league => 
        statusValues.includes(league.status)
      );
    }
    
    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching public leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}
