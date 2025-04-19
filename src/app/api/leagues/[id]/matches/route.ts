import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel, MatchModel } from '@/models';
import { createLogger } from '@/lib/logger';

const logger = createLogger('LeagueMatchesAPI');

// GET /api/leagues/[id]/matches - Get all matches for a league
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`GET matches request for league: ${params.id}`);
  
  try {
    const leagueId = params.id;
    const url = new URL(request.url);
    
    // Get query parameters for filtering
    const status = url.searchParams.get('status');
    const teamId = url.searchParams.get('team');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    
    const matches = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      logger.info(`Fetching matches for league: ${league.name}`);
      
      // Build query object for filtering
      const query: any = { league: leagueId };
      
      if (status) {
        query.status = status;
      }
      
      if (teamId) {
        // Filter for matches where the given team is either team A or team B
        query.$or = [
          { teamA: teamId },
          { teamB: teamId }
        ];
      }
      
      // Create the base query
      let matchQuery = MatchModel.find(query)
        .populate({
          path: 'teamA',
          select: 'name'
        })
        .populate({
          path: 'teamB',
          select: 'name'
        });
      
      // Apply sorting - sort by date ascending for future matches, date descending for past matches
      matchQuery = matchQuery.sort({ scheduledDate: status === 'completed' ? -1 : 1 });
      
      // Apply limit if specified
      if (limit) {
        matchQuery = matchQuery.limit(limit);
      }
      
      const matches = await matchQuery.exec();
      
      logger.info(`Found ${matches.length} matches for league ${leagueId}`);
      
      return matches;
    });
    
    return NextResponse.json(matches);
  } catch (error) {
    logger.error('Error fetching league matches:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch league matches' },
      { status: 500 }
    );
  }
}

// POST /api/leagues/[id]/matches - Create a new match in the league
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`POST create match request for league: ${params.id}`);
  
  try {
    const leagueId = params.id;
    const data = await request.json();
    
    const match = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      // Validate required fields
      if (!data.teamA || !data.teamB || !data.scheduledDate) {
        throw new Error('Missing required fields: teamA, teamB, scheduledDate');
      }
      
      // Create new match
      const match = new MatchModel({
        league: leagueId,
        teamA: data.teamA,
        teamB: data.teamB,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        location: data.location,
        status: data.status || 'scheduled'
      });
      
      await match.save();
      logger.info(`Created new match in league ${leagueId}`);
      
      return match;
    });
    
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    logger.error('Error creating match:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Missing required fields')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
