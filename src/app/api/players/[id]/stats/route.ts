import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { PlayerModel, TeamModel, MatchModel, LeagueModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    // Get the optional leagueId from query parameters
    const url = new URL(request.url);
    const leagueId = url.searchParams.get('leagueId');
    
    // Return mock data for initial testing
    const mockData = {
      playerName: "John Doe",
      wins: 12,
      losses: 4,
      totalMatches: 16,
      winRate: 75,
      setsWon: 28,
      totalSets: 35,
      setsWonPercentage: 80,
      leagueAvgWinRate: 58,
      winRateTrend: 5,
      lastFiveMatches: ["W", "W", "L", "W", "W"],
      consecutiveWins: 2,
      bestScore: "6-2",
      averageScore: "6.3-4.2",
      teams: [
        { id: "1", name: "Team Alpha" },
        { id: "2", name: "Team Omega" }
      ],
      generatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({ stats: mockData });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
