import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel, TeamModel, MatchModel, RankingModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// GET /api/leagues/[id] - Get a specific league by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }
    
    const league = await withConnection(async () => {
      const league = await LeagueModel.findById(id)
        .populate('organizer', 'name email')
        .populate({
          path: 'teams',
          populate: {
            path: 'players',
            select: 'nickname skillLevel handedness preferredPosition profileImage'
          }
        });
      
      if (!league) {
        throw new Error('League not found');
      }
      
      return league;
    });
    
    return NextResponse.json(league);
  } catch (error) {
    console.error('Error fetching league:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch league' },
      { status: 500 }
    );
  }
}

// PATCH /api/leagues/[id] - Update a league (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }
    
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
    
    const updateData = await request.json();
    
    // Create a clean update object
    const updateObj: any = {};
    
    // Only include fields that are present in the request body
    if (updateData.name !== undefined) {
      updateObj.name = updateData.name;
    }
    
    if (updateData.description !== undefined) {
      updateObj.description = updateData.description;
    }
    
    if (updateData.venue !== undefined) {
      updateObj.venue = updateData.venue;
    }
    
    if (updateData.matchFormat !== undefined) {
      updateObj.matchFormat = updateData.matchFormat;
    }
    
    if (updateData.maxTeams !== undefined) {
      updateObj.maxTeams = updateData.maxTeams;
    }
    
    if (updateData.minTeams !== undefined) {
      updateObj.minTeams = updateData.minTeams;
    }
    
    if (updateData.pointsPerWin !== undefined) {
      updateObj.pointsPerWin = updateData.pointsPerWin;
    }
    
    if (updateData.pointsPerLoss !== undefined) {
      updateObj.pointsPerLoss = updateData.pointsPerLoss;
    }
    
    if (updateData.status !== undefined) {
      updateObj.status = updateData.status;
    }
    
    // Handle date fields specially to avoid "Invalid Date" errors
    if (updateData.startDate) {
      const startDate = new Date(updateData.startDate);
      if (!isNaN(startDate.getTime())) {
        updateObj.startDate = startDate;
      }
    }
    
    if (updateData.endDate) {
      const endDate = new Date(updateData.endDate);
      if (!isNaN(endDate.getTime())) {
        updateObj.endDate = endDate;
      }
    }
    
    if (updateData.registrationDeadline) {
      const registrationDeadline = new Date(updateData.registrationDeadline);
      if (!isNaN(registrationDeadline.getTime())) {
        updateObj.registrationDeadline = registrationDeadline;
      }
    }
    
    // Perform the update
    const updatedLeague = await withConnection(async () => {
      const league = await LeagueModel.findById(id);
      
      if (!league) {
        throw new Error('League not found');
      }
      
      // Check if user is the organizer or an admin
      const isOrganizer = league.organizer.toString() === session.user.id;
      
      if (!isOrganizer && !adminCheck) {
        throw new Error('Only league organizers can update their leagues');
      }
      
      // Apply the update
      const updated = await LeagueModel.findByIdAndUpdate(
        id,
        { $set: updateObj },
        { new: true, runValidators: true }
      )
        .populate('organizer', 'name email')
        .populate({
          path: 'teams',
          populate: {
            path: 'players',
            select: 'nickname skillLevel'
          }
        });
      
      return updated;
    });
    
    return NextResponse.json(updatedLeague);
  } catch (error) {
    console.error('Error updating league:', error);
    
    if (error instanceof Error) {
      if (error.message === 'League not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Only league organizers can update their leagues') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update league' },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/[id] - Delete a league and associated data (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'League ID is required' },
        { status: 400 }
      );
    }
    
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
    
    // Get cascade options from the request
    let cascadeOptions = { deleteTeams: true };
    
    // If the request has a body, parse it to get cascade options
    if (request.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = await request.json();
        cascadeOptions = {
          ...cascadeOptions,
          ...body.cascadeOptions
        };
      } catch (e) {
        console.warn('Error parsing request body, using default cascade options:', e);
      }
    }
    
    const results = await withConnection(async () => {
      // 1. Find the league
      const league = await LeagueModel.findById(id);
      
      if (!league) {
        throw new Error('League not found');
      }
      
      // Check if user is the organizer or an admin
      const isOrganizer = league.organizer.toString() === session.user.id;
      
      if (!isOrganizer && !adminCheck) {
        throw new Error('Only league organizers or admins can delete leagues');
      }
      
      // 2. Get all teams in this league
      const teams = league.teams || [];
      
      // 3. Delete all matches associated with this league
      const deletedMatches = await MatchModel.deleteMany({ league: id });
      
      // 4. Delete all rankings associated with this league
      const deletedRankings = await RankingModel.deleteMany({ league: id });
      
      // 5. Handle teams based on cascade options
      let teamsDeleted = 0;
      let teamsUpdated = 0;
      
      if (teams.length > 0) {
        if (cascadeOptions.deleteTeams) {
          // Delete teams if the option is selected
          const result = await TeamModel.deleteMany({ _id: { $in: teams } });
          teamsDeleted = result.deletedCount;
        } else {
          // Otherwise just remove the league association
          await TeamModel.updateMany(
            { _id: { $in: teams } },
            { $unset: { league: 1 } }
          );
          teamsUpdated = teams.length;
        }
      }
      
      // 6. Delete the league itself
      const deletedLeague = await LeagueModel.findByIdAndDelete(id);
      
      return {
        league: deletedLeague,
        matches: deletedMatches.deletedCount,
        rankings: deletedRankings.deletedCount,
        teamsDeleted,
        teamsUpdated
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'League deleted successfully',
      details: {
        leagueName: results.league.name,
        matchesDeleted: results.matches,
        rankingsDeleted: results.rankings,
        teamsDeleted: results.teamsDeleted,
        teamsUpdated: results.teamsUpdated
      }
    });
  } catch (error) {
    console.error('Error deleting league:', error);
    
    if (error instanceof Error) {
      if (error.message === 'League not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Only league organizers or admins can delete leagues') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete league' },
      { status: 500 }
    );
  }
}
