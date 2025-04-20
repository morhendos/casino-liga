import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { LeagueModel, MatchModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

// Valid league statuses
const VALID_STATUSES = ['draft', 'registration', 'active', 'completed', 'canceled'];

// PUT /api/leagues/[id]/status - Update a league's status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const isAdmin = hasRole(session, ROLES.ADMIN);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }

    const leagueId = params.id;
    const requestData = await request.json();
    const newStatus = requestData.status;

    // Validate status
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status provided' },
        { status: 400 }
      );
    }

    const result = await withConnection(async () => {
      // Get the league
      const league = await LeagueModel.findById(leagueId);
      if (!league) {
        throw new Error('League not found');
      }

      const currentStatus = league.status;

      // Check if status is unchanged
      if (currentStatus === newStatus) {
        return { message: 'Status unchanged', league };
      }

      // Validate status transitions
      await validateStatusTransition(league, currentStatus, newStatus);

      // Update the league status
      league.status = newStatus;
      
      // Perform additional status-specific operations
      await handleStatusSpecificOperations(league, currentStatus, newStatus);

      // Save the updated league
      await league.save();

      return { 
        message: `League status updated from ${currentStatus} to ${newStatus}`,
        league
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating league status:', error);

    if (error instanceof Error) {
      // Return different status codes based on error type
      const errorMessages: { [key: string]: number } = {
        'League not found': 404,
        'Invalid status transition': 400,
        'Insufficient teams': 400,
        'Schedule required': 400,
        'League already active': 400,
        'League already completed': 400
      };

      // Find the matching error or default to 500
      const statusCode = Object.keys(errorMessages).find(msg => 
        error.message.includes(msg)
      );

      if (statusCode) {
        return NextResponse.json(
          { error: error.message },
          { status: errorMessages[statusCode] }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update league status' },
      { status: 500 }
    );
  }
}

/**
 * Validate if a status transition is allowed
 */
async function validateStatusTransition(league: any, currentStatus: string, newStatus: string) {
  // Draft can transition to registration or canceled
  if (currentStatus === 'draft') {
    if (newStatus !== 'registration' && newStatus !== 'canceled') {
      throw new Error('Invalid status transition: Draft can only move to Registration or be Canceled');
    }
  }
  
  // Registration can transition to active, draft, or canceled
  else if (currentStatus === 'registration') {
    if (newStatus === 'active') {
      // Check if league has enough teams
      if (league.teams.length < league.minTeams) {
        throw new Error(`Insufficient teams: League requires at least ${league.minTeams} teams`);
      }
      
      // Check if schedule is generated
      if (!league.scheduleGenerated) {
        throw new Error('Schedule required: Cannot activate league without generating a schedule');
      }
    }
    else if (newStatus !== 'draft' && newStatus !== 'canceled') {
      throw new Error('Invalid status transition: Registration can only move to Active, back to Draft, or be Canceled');
    }
  }
  
  // Active can transition to completed or canceled
  else if (currentStatus === 'active') {
    if (newStatus !== 'completed' && newStatus !== 'canceled') {
      throw new Error('Invalid status transition: Active league can only be Completed or Canceled');
    }
  }
  
  // Completed state is terminal, but canceled can go back to draft
  else if (currentStatus === 'completed') {
    throw new Error(`Invalid status transition: Cannot change status from ${currentStatus}`);
  }
  else if (currentStatus === 'canceled') {
    if (newStatus !== 'draft') {
      throw new Error('Invalid status transition: Canceled league can only be restored to Draft status');
    }
  }
}

/**
 * Handle additional operations that should occur when changing status
 */
async function handleStatusSpecificOperations(league: any, currentStatus: string, newStatus: string) {
  // When activating a league
  if (newStatus === 'active' && currentStatus !== 'active') {
    // Set the activation date if not already set
    if (!league.activatedAt) {
      league.activatedAt = new Date();
    }
    
    // Any other activation tasks
  }
  
  // When completing a league
  else if (newStatus === 'completed' && currentStatus !== 'completed') {
    // Set the completion date
    league.completedAt = new Date();
    
    // Finalize any incomplete matches
    await finalizeIncompleteMatches(league._id);
    
    // Any other completion tasks
  }
  
  // When canceling a league
  else if (newStatus === 'canceled' && currentStatus !== 'canceled') {
    // Set the cancellation date
    league.canceledAt = new Date();
    
    // Cancel any scheduled matches
    await cancelScheduledMatches(league._id);
    
    // Any other cancellation tasks
  }
  
  // When restoring a canceled league to draft
  else if (newStatus === 'draft' && currentStatus === 'canceled') {
    // Clear the cancellation date
    league.canceledAt = null;
    
    // Any other restoration tasks
  }
}

/**
 * Finalize any incomplete matches when completing a league
 */
async function finalizeIncompleteMatches(leagueId: string) {
  // Find matches that are not completed or canceled
  const pendingMatches = await MatchModel.find({
    league: leagueId,
    status: { $nin: ['completed', 'canceled'] }
  });
  
  // Update them to canceled status
  if (pendingMatches.length > 0) {
    await MatchModel.updateMany(
      { 
        _id: { $in: pendingMatches.map(match => match._id) } 
      },
      { 
        status: 'canceled',
        notes: 'Automatically canceled when league was completed'
      }
    );
  }
}

/**
 * Cancel all scheduled matches when canceling a league
 */
async function cancelScheduledMatches(leagueId: string) {
  await MatchModel.updateMany(
    { 
      league: leagueId,
      status: { $ne: 'canceled' }
    },
    { 
      status: 'canceled',
      notes: 'Automatically canceled when league was canceled'
    }
  );
}