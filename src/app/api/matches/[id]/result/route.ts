import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { MatchModel, LeagueModel, TeamModel, RankingModel } from '@/models';
import { createLogger } from '@/lib/logger';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

const logger = createLogger('MatchResultAPI');

// Helper function to calculate new rankings after a match
async function updateRankings(
  leagueId: string, 
  matchId: string, 
  teamAId: string, 
  teamBId: string, 
  winnerId: string
) {
  logger.info(`Updating rankings for league ${leagueId} after match ${matchId}`);
  
  try {
    // Get league settings for points
    const league = await LeagueModel.findById(leagueId);
    
    if (!league) {
      throw new Error('League not found');
    }
    
    const pointsPerWin = league.pointsPerWin || 3;  // Default to 3
    const pointsPerLoss = league.pointsPerLoss || 0; // Default to 0
    
    // Update or create ranking for team A
    let rankingA = await RankingModel.findOne({
      league: leagueId,
      team: teamAId
    });
    
    if (!rankingA) {
      rankingA = new RankingModel({
        league: leagueId,
        team: teamAId,
        points: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0
      });
    }
    
    // Update or create ranking for team B
    let rankingB = await RankingModel.findOne({
      league: leagueId,
      team: teamBId
    });
    
    if (!rankingB) {
      rankingB = new RankingModel({
        league: leagueId,
        team: teamBId,
        points: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0
      });
    }
    
    // Update statistics based on match result
    rankingA.matchesPlayed += 1;
    rankingB.matchesPlayed += 1;
    
    if (winnerId === teamAId) {
      rankingA.wins += 1;
      rankingA.points += pointsPerWin;
      rankingB.losses += 1;
      rankingB.points += pointsPerLoss;
    } else {
      rankingB.wins += 1;
      rankingB.points += pointsPerWin;
      rankingA.losses += 1;
      rankingA.points += pointsPerLoss;
    }
    
    // Save updated rankings
    await rankingA.save();
    await rankingB.save();
    
    logger.info(`Rankings updated successfully for teams ${teamAId} and ${teamBId}`);
    
    return { rankingA, rankingB };
  } catch (error) {
    logger.error('Error updating rankings:', error);
    throw error;
  }
}

// PUT /api/matches/[id]/result - Record or update a match result
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`PUT match result request for match ID: ${params.id}`);
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.error('Unauthorized attempt to record match result - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const matchId = params.id;
    const requestData = await request.json();
    
    logger.info(`Request data for match ${matchId}:`, requestData);
    
    // Validate the request data
    if (!requestData.result || 
        !Array.isArray(requestData.result.teamAScore) || 
        !Array.isArray(requestData.result.teamBScore) ||
        !requestData.result.winner) {
      logger.error('Invalid request data format');
      return NextResponse.json(
        { error: 'Invalid result format' },
        { status: 400 }
      );
    }
    
    // Process the match result update
    const updatedMatch = await withConnection(async () => {
      // Find the match
      const match = await MatchModel.findById(matchId);
      
      if (!match) {
        logger.error(`Match not found: ${matchId}`);
        throw new Error('Match not found');
      }
      
      // Check authorization
      const isAdmin = hasRole(session, ROLES.ADMIN);
      
      // Get the league to check if user is the organizer
      const league = await LeagueModel.findById(match.league);
      
      if (!league) {
        logger.error(`League not found for match: ${matchId}`);
        throw new Error('League not found');
      }
      
      const isOrganizer = league.organizer && league.organizer.toString() === session.user.id;
      
      // Check if user is authorized to record result
      if (!isAdmin && !isOrganizer) {
        // For regular users, check if they are part of the teams
        const teamA = await TeamModel.findById(match.teamA).populate('players');
        const teamB = await TeamModel.findById(match.teamB).populate('players');
        
        const isTeamAPlayer = teamA?.players.some(player => 
          player.user && player.user.toString() === session.user.id
        );
        
        const isTeamBPlayer = teamB?.players.some(player => 
          player.user && player.user.toString() === session.user.id
        );
        
        if (!isTeamAPlayer && !isTeamBPlayer) {
          logger.error(`User ${session.user.id} not authorized to record result for match ${matchId}`);
          throw new Error('Unauthorized: You must be an admin, league organizer, or a player in this match');
        }
      }
      
      // Verify that the winner is one of the teams
      const teamAId = match.teamA.toString();
      const teamBId = match.teamB.toString();
      const winnerId = requestData.result.winner;
      
      if (winnerId !== teamAId && winnerId !== teamBId) {
        logger.error(`Invalid winner ID: ${winnerId}, must be ${teamAId} or ${teamBId}`);
        throw new Error('Winner must be one of the teams in the match');
      }
      
      // Validate the scores to ensure they match the winner
      const { teamAScore, teamBScore } = requestData.result;
      let teamAWins = 0;
      let teamBWins = 0;
      
      for (let i = 0; i < teamAScore.length; i++) {
        if (teamAScore[i] > teamBScore[i]) {
          teamAWins++;
        } else if (teamBScore[i] > teamAScore[i]) {
          teamBWins++;
        }
      }
      
      // Determine expected winner based on sets
      const expectedWinner = teamAWins > teamBWins ? teamAId : teamBId;
      
      if (expectedWinner !== winnerId) {
        logger.error(`Winner (${winnerId}) doesn't match expected winner from scores (${expectedWinner})`);
        throw new Error('Winner does not match the scores provided');
      }
      
      // Update match with result and status
      match.result = {
        teamAScore: requestData.result.teamAScore,
        teamBScore: requestData.result.teamBScore,
        winner: requestData.result.winner
      };
      
      match.status = 'completed';
      match.submittedBy = session.user.id;
      
      // Update confirmed by if admin or organizer
      if (isAdmin || isOrganizer) {
        match.confirmedBy = session.user.id;
      }
      
      // Save the match
      await match.save();
      logger.info(`Match ${matchId} result updated successfully`);
      
      // Update rankings
      await updateRankings(
        match.league.toString(),
        matchId,
        teamAId,
        teamBId,
        winnerId
      );
      
      return match;
    });
    
    return NextResponse.json({
      message: 'Match result recorded successfully',
      match: updatedMatch
    });
  } catch (error) {
    logger.error('Error recording match result:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      if (error.message === 'Match not found' || error.message === 'League not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      // Validation errors
      if (error.message.includes('Winner') || error.message.includes('scores')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to record match result' },
      { status: 500 }
    );
  }
}

// GET /api/matches/[id]/result - Get a match result
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`GET match result request for match ID: ${params.id}`);
  
  try {
    const matchId = params.id;
    
    const match = await withConnection(async () => {
      const match = await MatchModel.findById(matchId);
      
      if (!match) {
        logger.error(`Match not found: ${matchId}`);
        throw new Error('Match not found');
      }
      
      if (!match.result) {
        logger.info(`No result found for match: ${matchId}`);
        return { hasResult: false };
      }
      
      return {
        hasResult: true,
        result: match.result,
        status: match.status
      };
    });
    
    return NextResponse.json(match);
  } catch (error) {
    logger.error('Error fetching match result:', error);
    
    if (error instanceof Error && error.message === 'Match not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch match result' },
      { status: 500 }
    );
  }
}
