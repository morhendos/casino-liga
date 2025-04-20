import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { LeagueModel, TeamModel, PlayerModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';
import mongoose from 'mongoose';

/**
 * Check if the user has admin permissions based on their session roles
 */
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// POST /api/leagues/[id]/teams - Create a team in a league
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const leagueId = params.id;
    const data = await request.json();
    
    // Validate team name
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }
    
    // Validate players
    if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
      return NextResponse.json(
        { error: 'At least one player is required' },
        { status: 400 }
      );
    }
    
    if (data.players.length > 2) {
      return NextResponse.json(
        { error: 'A team cannot have more than 2 players' },
        { status: 400 }
      );
    }
    
    const result = await withConnection(async () => {
      // 1. Check if league exists
      const league = await LeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }
      
      // 2. Check if team name is already taken
      const existingTeam = await TeamModel.findOne({ name: data.name.trim() });
      if (existingTeam) {
        throw new Error('Team with this name already exists');
      }
      
      // 3. Check if players exist and are active
      const playerIds = data.players.map((id: string) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (err) {
          return id;
        }
      });
      
      const players = await PlayerModel.find({ _id: { $in: playerIds } });
      
      if (players.length !== playerIds.length) {
        throw new Error('One or more players not found');
      }
      
      const inactivePlayers = players.filter(player => !player.isActive);
      if (inactivePlayers.length > 0) {
        throw new Error('One or more players are inactive');
      }
      
      // 4. Create the team with league ID
      const team = new TeamModel({
        name: data.name.trim(),
        players: playerIds,
        isActive: true,
        createdBy: session.user.id,
        league: new mongoose.Types.ObjectId(leagueId) // Properly set the league ID
      });
      
      const savedTeam = await team.save();
      
      // 5. Add team to league
      league.teams.push(savedTeam._id);
      await league.save();
      
      // 6. Return team with populated player data
      const populatedTeam = await TeamModel.findById(savedTeam._id).populate('players');
      
      return populatedTeam;
    });
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating team in league:', error);
    
    if (error instanceof Error) {
      const errorMap: { [key: string]: number } = {
        'League not found': 404,
        'Team with this name already exists': 409,
        'One or more players not found': 400,
        'One or more players are inactive': 400
      };
      
      const statusCode = errorMap[error.message] || 500;
      
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create team in league' },
      { status: 500 }
    );
  }
}

// GET /api/leagues/[id]/teams - Get all teams in a league
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id;
    
    const result = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }
      
      // Get teams with populated player data
      const teams = await TeamModel.find({ _id: { $in: league.teams } })
        .populate('players')
        .sort({ name: 1 });
      
      return {
        teams,
        leagueId: league._id,
        leagueName: league.name
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching teams for league:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
