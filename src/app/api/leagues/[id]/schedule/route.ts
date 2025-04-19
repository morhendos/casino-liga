import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { LeagueModel, MatchModel, TeamModel } from '@/models';
import { createLeagueSchedule } from '@/utils/scheduleGenerator';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';
import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('ScheduleAPI');

// GET /api/leagues/[id]/schedule - Get the schedule for a league
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`GET schedule request for league: ${params.id}`);
  
  try {
    const leagueId = params.id;
    
    const schedule = await withConnection(async () => {
      logger.info(`Checking if league ${leagueId} exists`);
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      logger.info(`League found: ${league.name}, status: ${league.status}, scheduleGenerated: ${league.scheduleGenerated}`);
      
      // Get all matches for this league, sorted by date
      logger.info(`Fetching matches for league: ${leagueId}`);
      const matches = await MatchModel.find({ league: leagueId })
        .sort({ scheduledDate: 1 });
        
      logger.info(`Found ${matches.length} matches, now populating team data`);
      
      // If no matches found, return empty array early
      if (matches.length === 0) {
        logger.info('No matches found for this league');
        return [];
      }
      
      // Debug the first match
      if (matches.length > 0) {
        const firstMatch = matches[0];
        logger.info(`Sample match before population - ID: ${firstMatch._id}, teamA: ${firstMatch.teamA}, teamB: ${firstMatch.teamB}`);
      }
      
      try {
        // Perform population with error handling
        const populatedMatches = await MatchModel.find({ league: leagueId })
          .sort({ scheduledDate: 1 })
          .populate({
            path: 'teamA',
            select: 'name players',
            populate: {
              path: 'players',
              select: 'nickname'
            }
          })
          .populate({
            path: 'teamB',
            select: 'name players',
            populate: {
              path: 'players',
              select: 'nickname'
            }
          });
          
        // Log a sample of populated match
        if (populatedMatches.length > 0) {
          const sampleMatch = populatedMatches[0];
          logger.info(`Sample match after population - teamA: ${sampleMatch.teamA?.name || 'undefined'}, teamB: ${sampleMatch.teamB?.name || 'undefined'}`);
        }
        
        return populatedMatches;
      } catch (populateError) {
        logger.error('Error during populate operation:', populateError);
        
        // Fallback: return matches without population if populate fails
        logger.info('Falling back to returning matches without population');
        
        // Manual population as fallback
        const teams = await TeamModel.find({
          _id: { $in: [...new Set([...matches.map(m => m.teamA), ...matches.map(m => m.teamB)])] }
        }).select('name players');
        
        logger.info(`Found ${teams.length} teams for manual population`);
        
        // Create a map for quick lookup
        const teamMap = teams.reduce((map, team) => {
          map[team._id.toString()] = team;
          return map;
        }, {});
        
        // Manually populate the matches
        const manuallyPopulated = matches.map(match => {
          const result = match.toObject();
          result.teamA = teamMap[match.teamA.toString()] || { name: 'Unknown Team', _id: match.teamA };
          result.teamB = teamMap[match.teamB.toString()] || { name: 'Unknown Team', _id: match.teamB };
          return result;
        });
        
        return manuallyPopulated;
      }
    });
    
    logger.info(`Returning ${schedule.length} matches`);
    return NextResponse.json(schedule);
  } catch (error) {
    logger.error('Error fetching league schedule:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch league schedule' },
      { status: 500 }
    );
  }
}

// POST /api/leagues/[id]/schedule - Generate a schedule for a league
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`POST schedule generation request for league: ${params.id}`);
  
  try {
    // Use authOptions to get the session properly
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      logger.error('Unauthorized schedule generation attempt - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const leagueId = params.id;
    logger.info(`User ${session.user.id} attempting to generate schedule for league ${leagueId}`);
    
    const schedule = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      logger.info(`League found: ${league.name}, teams: ${league.teams.length}, status: ${league.status}`);
      
      // Allow league creation if the user is an admin OR the league organizer
      const isAdmin = hasRole(session, ROLES.ADMIN);
      const isOrganizer = league.organizer && league.organizer.toString() === session.user.id;
      
      logger.info(`User permissions: isAdmin=${isAdmin}, isOrganizer=${isOrganizer}`);
      
      if (!isAdmin && !isOrganizer) {
        logger.error(`User ${session.user.id} not authorized to generate schedule`);
        throw new Error('Only the league organizer can generate a schedule');
      }
      
      // Check if league status allows schedule generation
      if (league.status !== 'draft' && league.status !== 'registration') {
        logger.error(`Invalid league status for schedule generation: ${league.status}`);
        throw new Error('Schedule can only be generated for leagues in draft or registration status');
      }
      
      // Check if schedule already exists
      const existingMatches = await MatchModel.countDocuments({ league: leagueId });
      
      if (existingMatches > 0) {
        // If matches exist, delete them (regenerate)
        logger.info(`Clearing ${existingMatches} existing matches for regeneration`);
        await MatchModel.deleteMany({ league: leagueId });
        logger.info('Cleared existing schedule for regeneration');
      }
      
      // Check if there are enough teams
      if (league.teams.length < 2) {
        logger.error(`Not enough teams: ${league.teams.length}`);
        throw new Error('League must have at least 2 teams to generate a schedule');
      }
      
      // Generate the schedule
      logger.info('Calling createLeagueSchedule');
      const createdMatches = await createLeagueSchedule(leagueId);
      logger.info(`Successfully created ${createdMatches.length} matches`);
      
      return {
        message: `Successfully generated ${createdMatches.length} matches`,
        matches: createdMatches
      };
    });
    
    return NextResponse.json(schedule);
  } catch (error) {
    logger.error('Error generating league schedule:', error);
    
    if (error instanceof Error) {
      if (error.message === 'League not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Only the league organizer can generate a schedule') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      // Validation errors
      if (error.message === 'Schedule can only be generated for leagues in draft or registration status' ||
          error.message === 'Schedule already exists for this league' ||
          error.message === 'League must have at least 2 teams to generate a schedule' ||
          error.message === 'Schedule has already been generated for this league' ||
          error.message.includes('Not enough days')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate league schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/[id]/schedule - Clear the schedule for a league
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`DELETE schedule request for league: ${params.id}`);
  
  try {
    // Use authOptions to get the session properly
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const leagueId = params.id;
    
    await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        throw new Error('League not found');
      }
      
      // Allow operation if the user is an admin OR the league organizer
      const isAdmin = hasRole(session, ROLES.ADMIN);
      const isOrganizer = league.organizer && league.organizer.toString() === session.user.id;
      
      if (!isAdmin && !isOrganizer) {
        throw new Error('Only the league organizer can clear a schedule');
      }
      
      // Check if league status allows schedule clearing
      if (league.status !== 'draft' && league.status !== 'registration') {
        throw new Error('Schedule can only be cleared for leagues in draft or registration status');
      }
      
      // Delete all matches for this league
      const result = await MatchModel.deleteMany({ league: leagueId });
      logger.info(`Deleted ${result.deletedCount} matches for league ${leagueId}`);
      
      // Update the league to mark schedule as not generated
      league.scheduleGenerated = false;
      await league.save();
      logger.info(`Updated league ${leagueId} scheduleGenerated flag to false`);
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Error clearing league schedule:', error);
    
    if (error instanceof Error) {
      if (error.message === 'League not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Only the league organizer can clear a schedule') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      // Validation errors
      if (error.message === 'Schedule can only be cleared for leagues in draft or registration status') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to clear league schedule' },
      { status: 500 }
    );
  }
}