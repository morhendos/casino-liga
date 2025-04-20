import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { MatchModel, TeamModel, PlayerModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

// PUT /api/matches/[id]/schedule - Update the schedule for a specific match
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const matchId = params.id;
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const { scheduledDate, scheduledTime, location } = data;
    
    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }
    
    const updatedMatch = await withConnection(async () => {
      // Get the match
      const match = await MatchModel.findById(matchId)
        .populate({
          path: 'teamA',
          select: 'players'
        })
        .populate({
          path: 'teamB',
          select: 'players'
        });
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      // Check user permissions
      const isAdmin = hasRole(session, ROLES.ADMIN);
      
      // Determine if user is a player in one of the teams
      let isPlayerInvolved = false;
      
      if (!isAdmin) {
        // Get all players in both teams
        const teamAPlayers = match.teamA.players || [];
        const teamBPlayers = match.teamB.players || [];
        const allPlayerIds = [...teamAPlayers, ...teamBPlayers];
        
        // Find if current user has a player profile that's part of the teams
        const playerProfiles = await PlayerModel.find({
          userId: session.user.id,
          _id: { $in: allPlayerIds }
        });
        
        isPlayerInvolved = playerProfiles.length > 0;
      }
      
      // Allow scheduling if user is admin or a player in the match
      if (!isAdmin && !isPlayerInvolved) {
        throw new Error('Only administrators or players involved in the match can schedule it');
      }
      
      // Properly update the match with the date and time
      // First convert scheduledDate to a proper Date object
      const parsedDate = new Date(scheduledDate);
      
      // Validate that the date is valid
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Update match fields
      match.scheduledDate = parsedDate;
      match.scheduledTime = scheduledTime || '';
      match.location = location || '';
      match.status = 'scheduled'; // Update status to scheduled
      
      // Save the updated match
      const savedMatch = await match.save();
      
      // Return a clean response that includes only the necessary information
      return {
        id: savedMatch._id,
        teamA: match.teamA,
        teamB: match.teamB,
        scheduledDate: savedMatch.scheduledDate,
        scheduledTime: savedMatch.scheduledTime,
        location: savedMatch.location,
        status: savedMatch.status
      };
    });
    
    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Error scheduling match:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Match not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Invalid date format') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Only administrators or players')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      // Return validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation error details:', error);
        return NextResponse.json(
          { error: 'Validation error. Please check the time format (HH:MM).' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to schedule match' },
      { status: 500 }
    );
  }
}
