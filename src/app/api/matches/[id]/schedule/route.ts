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
    console.log('Received scheduling data:', data);
    const { scheduledDate, scheduledTime, location } = data;
    
    if (!scheduledDate) {
      return NextResponse.json(
        { error: 'Scheduled date is required' },
        { status: 400 }
      );
    }
    
    const updatedMatch = await withConnection(async () => {
      // Find match without populating relations first
      console.log('Finding match with ID:', matchId);
      const match = await MatchModel.findById(matchId);
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      console.log('Original match data:', match);
      
      // Check user permissions
      const isAdmin = hasRole(session, ROLES.ADMIN);
      
      // Determine if user is a player in one of the teams
      let isPlayerInvolved = false;
      
      if (!isAdmin) {
        // Load team data
        const teamA = await TeamModel.findById(match.teamA);
        const teamB = await TeamModel.findById(match.teamB);
        
        // Get all players in both teams
        const teamAPlayers = teamA?.players || [];
        const teamBPlayers = teamB?.players || [];
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
      try {
        // First convert scheduledDate to a proper Date object
        let parsedDate: Date;
        
        if (typeof scheduledDate === 'string') {
          parsedDate = new Date(scheduledDate);
        } else if (scheduledDate instanceof Date) {
          parsedDate = scheduledDate;
        } else {
          throw new Error('Invalid date format');
        }
        
        // Validate that the date is valid
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date format');
        }
        
        console.log('Parsed date for updating:', parsedDate);
        
        // Directly update with updateOne to avoid validation issues
        const updateResult = await MatchModel.updateOne(
          { _id: matchId },
          { 
            $set: {
              scheduledDate: parsedDate,
              scheduledTime: scheduledTime || '',
              location: location || '',
              status: 'scheduled'
            }
          }
        );
        
        console.log('Update result:', updateResult);
        
        // Get the updated match
        const updatedMatch = await MatchModel.findById(matchId);
        console.log('Updated match:', updatedMatch);
        
        if (!updatedMatch) {
          throw new Error('Failed to retrieve updated match');
        }
        
        // Return clean response
        return {
          id: updatedMatch._id,
          teamA: { id: updatedMatch.teamA, name: 'Team A' },
          teamB: { id: updatedMatch.teamB, name: 'Team B' },
          scheduledDate: updatedMatch.scheduledDate,
          scheduledTime: updatedMatch.scheduledTime,
          location: updatedMatch.location,
          status: updatedMatch.status
        };
      } catch (err) {
        console.error('Error updating match:', err);
        throw err;
      }
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
