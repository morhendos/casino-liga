import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { MatchModel, LeagueModel, TeamModel } from '@/models';
import { createLogger } from '@/lib/logger';

const logger = createLogger('MatchAPI');

// GET /api/matches/[id] - Get a specific match with populated data
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`GET match request for ID: ${params.id}`);
  
  try {
    const matchId = params.id;
    
    const match = await withConnection(async () => {
      // Get the match
      const match = await MatchModel.findById(matchId).lean();
      
      if (!match) {
        logger.error(`Match not found: ${matchId}`);
        throw new Error('Match not found');
      }
      
      logger.info(`Match found: ${match._id}, status: ${match.status}`);
      
      // Get the league
      const league = await LeagueModel.findById(match.league).select('name').lean();
      if (!league) {
        logger.warn(`League not found for match: ${matchId}, league ID: ${match.league}`);
      }
      
      // Get teams
      const teamIds = [match.teamA, match.teamB].filter(id => id);
      const teams = await TeamModel.find({ _id: { $in: teamIds } }).lean();
      
      // Create lookup map for teams
      const teamMap = teams.reduce((map, team) => {
        map[team._id.toString()] = team;
        return map;
      }, {});
      
      // Create a placeholder for missing entities
      const placeholderTeam = {
        name: 'Unknown Team (Reference Missing)',
        players: []
      };
      
      const placeholderLeague = {
        name: 'Unknown League (Reference Missing)'
      };
      
      // Construct the response with populated data
      const populatedMatch = {
        ...match,
        id: match._id,
        league: league 
          ? { ...league, id: league._id } 
          : { ...placeholderLeague, id: match.league }
      };
      
      // Handle teamA population
      if (match.teamA) {
        const teamAId = match.teamA.toString();
        populatedMatch.teamA = teamMap[teamAId] 
          ? { ...teamMap[teamAId], id: teamAId } 
          : { ...placeholderTeam, id: teamAId };
      } else {
        populatedMatch.teamA = { ...placeholderTeam, id: 'missing-team-a' };
      }
      
      // Handle teamB population
      if (match.teamB) {
        const teamBId = match.teamB.toString();
        populatedMatch.teamB = teamMap[teamBId] 
          ? { ...teamMap[teamBId], id: teamBId } 
          : { ...placeholderTeam, id: teamBId };
      } else {
        populatedMatch.teamB = { ...placeholderTeam, id: 'missing-team-b' };
      }
      
      return populatedMatch;
    });
    
    logger.info(`Returning match data for ${matchId}`);
    return NextResponse.json(match);
  } catch (error) {
    logger.error('Error fetching match:', error);
    
    if (error instanceof Error && error.message === 'Match not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}

// PATCH /api/matches/[id] - Update a match
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`PATCH match request for ID: ${params.id}`);
  
  try {
    const matchId = params.id;
    const requestData = await request.json();
    
    logger.info(`Updating match ${matchId} with data:`, requestData);
    
    // Validate the allowed fields to update
    const allowedFields = ['scheduledDate', 'scheduledTime', 'location', 'status'];
    const updateData = {};
    
    // Only include allowed fields
    allowedFields.forEach(field => {
      if (requestData[field] !== undefined) {
        updateData[field] = requestData[field];
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const updatedMatch = await withConnection(async () => {
      // Find and update the match
      const match = await MatchModel.findByIdAndUpdate(
        matchId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!match) {
        throw new Error('Match not found');
      }
      
      logger.info(`Successfully updated match ${matchId}`);
      return match;
    });
    
    return NextResponse.json(updatedMatch);
  } catch (error) {
    logger.error('Error updating match:', error);
    
    if (error instanceof Error && error.message === 'Match not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
