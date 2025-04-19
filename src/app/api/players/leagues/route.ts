import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel, TeamModel, PlayerModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint to get all players in a league
 * GET /api/players/leagues?leagueId=123
 */
export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const leagueId = url.searchParams.get('leagueId');

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // Get players for the specified league
    const players = await withConnection(async () => {
      // First, check if the league exists
      const league = await LeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      // Get all teams in the league
      const teams = await TeamModel.find({ _id: { $in: league.teams } });
      
      // Extract player IDs from all teams
      const playerIds = teams.reduce((acc, team) => {
        return [...acc, ...(team.players || [])];
      }, []);

      // Get all players
      const players = await PlayerModel.find({ _id: { $in: playerIds } });
      
      // Format the response
      return players.map(player => ({
        id: player._id,
        nickname: player.nickname || 'Unnamed Player',
        name: player.name
      }));
    });

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching players by league:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}