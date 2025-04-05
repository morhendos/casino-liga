import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { PlayerModel, TeamModel, LeagueModel } from '@/models';

/**
 * GET /api/players/leagues
 * 
 * Get all leagues where the current authenticated player is participating via their teams
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const active = searchParams.get('active') === 'true';
    
    const playerLeaguesData = await withConnection(async () => {
      // 1. Find the player profile for the current user
      const player = await PlayerModel.findOne({ userId: session.user.id });
      
      if (!player) {
        return {
          leagues: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        };
      }
      
      // 2. Find teams where the player is a member
      const teams = await TeamModel.find({ players: player._id });
      
      if (teams.length === 0) {
        return {
          leagues: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
          }
        };
      }
      
      const teamIds = teams.map(team => team._id);
      
      // 3. Find leagues where these teams are participating
      let leagueQuery: any = { teams: { $in: teamIds } };
      
      // Add status filter if provided
      if (status) {
        leagueQuery.status = status;
      } else if (active) {
        // If active=true is specified, filter to active and registration leagues
        leagueQuery.status = { $in: ['active', 'registration'] };
      }
      
      const leagues = await LeagueModel.find(leagueQuery)
        .populate('organizer', 'name email')
        .populate({
          path: 'teams',
          populate: {
            path: 'players',
            select: 'nickname skillLevel'
          }
        })
        .sort({ startDate: -1 });
      
      return {
        leagues,
        pagination: {
          total: leagues.length,
          page: 1,
          limit: leagues.length,
          pages: 1
        }
      };
    });
    
    return NextResponse.json(playerLeaguesData);
  } catch (error) {
    console.error('Error fetching player leagues:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch player leagues' },
      { status: 500 }
    );
  }
}
