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
        .sort({ scheduledDate: 1 })
        .lean(); // Using lean() for better performance
        
      logger.info(`Found ${matches.length} matches, now performing manual population`);
      
      // If no matches found, return empty array early
      if (matches.length === 0) {
        logger.info('No matches found for this league');
        return [];
      }
      
      // Extract all team IDs from the matches
      const teamIds = new Set();
      matches.forEach(match => {
        if (match.teamA) teamIds.add(match.teamA.toString());
        if (match.teamB) teamIds.add(match.teamB.toString());
      });
      
      logger.info(`Found ${teamIds.size} unique team IDs referenced in matches`);
      
      // Fetch all teams in one go
      const teams = await TeamModel.find({ 
        _id: { $in: Array.from(teamIds) } 
      }).lean();
      
      logger.info(`Found ${teams.length} teams out of ${teamIds.size} referenced teams`);
      
      // Create a lookup map for teams
      const teamMap = teams.reduce((map, team) => {
        map[team._id.toString()] = team;
        return map;
      }, {});
      
      // Create a placeholder for missing teams
      const placeholderTeam = {
        name: 'Unknown Team (Reference Missing)',
        players: []
      };
      
      // Manually populate the matches
      const populatedMatches = matches.map(match => {
        // Create shallow copy of the match
        const result = { ...match };
        
        // Handle teamA - use the team from the map if it exists, otherwise use placeholder
        if (match.teamA) {
          const teamAId = match.teamA.toString();
          result.teamA = teamMap[teamAId] 
            ? { ...teamMap[teamAId], id: teamAId } 
            : { ...placeholderTeam, id: teamAId, _id: teamAId };
        } else {
          // If teamA is null or undefined, use a placeholder with a generated ID
          result.teamA = { ...placeholderTeam, id: 'missing-team-a', _id: 'missing-team-a' };
        }
        
        // Handle teamB - use the team from the map if it exists, otherwise use placeholder
        if (match.teamB) {
          const teamBId = match.teamB.toString();
          result.teamB = teamMap[teamBId] 
            ? { ...teamMap[teamBId], id: teamBId } 
            : { ...placeholderTeam, id: teamBId, _id: teamBId };
        } else {
          // If teamB is null or undefined, use a placeholder with a generated ID
          result.teamB = { ...placeholderTeam, id: 'missing-team-b', _id: 'missing-team-b' };
        }
        
        return result;
      });
      
      // Log a sample of a populated match
      if (populatedMatches.length > 0) {
        const sampleMatch = populatedMatches[0];
        logger.info(`Sample match after manual population - teamA: ${sampleMatch.teamA?.name}, teamB: ${sampleMatch.teamB?.name}`);
      }
      
      return populatedMatches;
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
      
      // Verify that all team references in the league are valid
      if (league.teams && league.teams.length > 0) {
        const teamIds = league.teams.map(team => team.toString());
        logger.info(`Verifying existence of ${teamIds.length} teams`);
        
        const teams = await TeamModel.find({ _id: { $in: teamIds }}).select('_id').lean();
        
        if (teams.length !== teamIds.length) {
          logger.warn(`Only found ${teams.length} teams out of ${teamIds.length} referenced in the league`);
          
          // Filter out missing team references
          const validTeamIds = teams.map(team => team._id.toString());
          league.teams = league.teams.filter(teamId => 
            validTeamIds.includes(teamId.toString())
          );
          
          logger.info(`Filtered league.teams to ${league.teams.length} valid teams`);
          
          // Save the league with only valid team references
          await league.save();
        }
      }
      
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