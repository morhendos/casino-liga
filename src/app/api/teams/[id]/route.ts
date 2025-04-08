import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { TeamModel, PlayerModel, LeagueModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// GET /api/teams/[id] - Get a specific team by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const team = await withConnection(async () => {
      return TeamModel.findById(id).populate('players');
    });
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const data = await request.json();
    
    const team = await withConnection(async () => {
      const team = await TeamModel.findById(id);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      // Check if user is admin
      const adminCheck = await isAdmin();
      
      // Ensure user can only update teams they created or if they're an admin
      if (team.createdBy.toString() !== session.user.id && !adminCheck) {
        throw new Error('Unauthorized');
      }
      
      // Update only allowed fields
      if (data.name !== undefined) {
        // Check if team name is already taken
        if (data.name !== team.name) {
          const existingTeam = await TeamModel.findOne({ name: data.name });
          if (existingTeam) {
            throw new Error('Team with this name already exists');
          }
          team.name = data.name;
        }
      }
      
      if (data.players !== undefined) {
        // Validate players
        if (data.players.length !== 2) {
          throw new Error('A team must have exactly 2 players');
        }
        
        // Check if players exist
        for (const playerId of data.players) {
          const player = await PlayerModel.findById(playerId);
          if (!player) {
            throw new Error(`Player with ID ${playerId} not found`);
          }
          if (!player.isActive) {
            throw new Error(`Player with ID ${playerId} is not active`);
          }
        }
        
        team.players = data.players;
      }
      
      if (data.logo !== undefined) team.logo = data.logo;
      if (data.description !== undefined) team.description = data.description;
      if (data.isActive !== undefined) team.isActive = data.isActive;
      
      return await team.save();
    });
    
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Team not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      if (error.message === 'Team with this name already exists') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      if (error.message === 'A team must have exactly 2 players' ||
          error.message.includes('Player with ID')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete a team (permanently)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    await withConnection(async () => {
      const team = await TeamModel.findById(id);
      
      if (!team) {
        throw new Error('Team not found');
      }
      
      // Check if user is admin
      const adminCheck = await isAdmin();
      
      // Ensure user can only delete teams they created or if they're an admin
      if (team.createdBy.toString() !== session.user.id && !adminCheck) {
        throw new Error('Unauthorized');
      }
      
      // If team is part of a league, remove it from the league
      if (team.league) {
        await LeagueModel.updateOne(
          { _id: team.league },
          { $pull: { teams: team._id } }
        );
      }
      
      // Hard delete the team
      await TeamModel.findByIdAndDelete(id);
      
      return { success: true };
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Team deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Team not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}
