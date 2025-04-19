import { ObjectId } from 'mongoose';
import { MatchModel, LeagueModel } from '@/models';
import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('ScheduleGenerator');

/**
 * Generate a round-robin schedule for teams in a league
 * Every team plays against each other team once
 * 
 * @param leagueId - ID of the league
 * @param teamIds - Array of team IDs
 * @param startDate - Start date of the league
 * @param endDate - End date of the league
 * @param venue - Optional venue for matches
 * @returns Array of created match documents
 */
export async function generateRoundRobinSchedule(
  leagueId: string | ObjectId,
  teamIds: string[] | ObjectId[],
  startDate: Date,
  endDate: Date,
  venue?: string
): Promise<any[]> {
  logger.info(`Generating round-robin schedule for league ${leagueId} with ${teamIds.length} teams`);
  
  if (teamIds.length < 2) {
    logger.error(`Not enough teams: ${teamIds.length}`);
    throw new Error('At least 2 teams are required to generate a schedule');
  }
  
  // Convert dates to ensure they are Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  logger.info(`Date range: ${start.toISOString()} to ${end.toISOString()}`);
  
  // Calculate the total number of days available for the league
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate the total number of matches needed
  const totalMatches = (teamIds.length * (teamIds.length - 1)) / 2;
  
  logger.info(`Days available: ${totalDays}, Matches required: ${totalMatches}`);
  
  // Make sure there are enough days for all matches
  if (totalDays < totalMatches) {
    logger.error(`Not enough days (${totalDays}) for required matches (${totalMatches})`);
    throw new Error(`Not enough days (${totalDays}) to schedule all matches (${totalMatches})`);
  }
  
  // Create a copy of the team IDs array to work with
  const teams = [...teamIds];
  
  // If odd number of teams, add a dummy team for the algorithm
  const hasDummy = teams.length % 2 === 1;
  if (hasDummy) {
    logger.info('Adding dummy team for odd number of teams');
    teams.push('dummy');
  }
  
  const n = teams.length;
  const matches = [];
  
  // Calculate days between each match
  const daysBetweenMatches = Math.floor(totalDays / totalMatches);
  logger.info(`Days between matches: ${daysBetweenMatches}`);
  
  let matchIndex = 0;
  
  // Generate rounds
  for (let round = 0; round < n - 1; round++) {
    logger.info(`Generating round ${round + 1} of ${n - 1}`);
    
    // Generate matches for this round
    for (let i = 0; i < n / 2; i++) {
      const team1 = teams[i];
      const team2 = teams[n - 1 - i];
      
      // Skip matches involving the dummy team
      if (team1 !== 'dummy' && team2 !== 'dummy') {
        // Calculate the date for this match
        const matchDate = new Date(start);
        matchDate.setDate(start.getDate() + (matchIndex * daysBetweenMatches));
        
        logger.debug(`Creating match: ${team1} vs ${team2} on ${matchDate.toISOString()}`);
        
        matches.push({
          league: leagueId,
          teamA: team1,
          teamB: team2,
          scheduledDate: matchDate,
          location: venue,
          status: 'scheduled'
        });
        
        matchIndex++;
      } else {
        logger.debug(`Skipping match with dummy team: ${team1} vs ${team2}`);
      }
    }
    
    // Rotate teams for the next round (keeping team[0] fixed)
    const lastTeam = teams.pop();
    if (lastTeam !== undefined) {
      teams.splice(1, 0, lastTeam);
      logger.debug('Rotated teams for next round');
    }
  }
  
  logger.info(`Generated ${matches.length} matches`);
  
  return matches;
}

/**
 * Create matches in the database based on a generated schedule
 * 
 * @param leagueId - ID of the league
 * @returns Promise with the created matches
 */
export async function createLeagueSchedule(leagueId: string | ObjectId): Promise<any[]> {
  logger.info(`Creating league schedule for league ${leagueId}`);
  
  // Get the league
  const league = await LeagueModel.findById(leagueId);
  
  if (!league) {
    logger.error(`League not found: ${leagueId}`);
    throw new Error('League not found');
  }
  
  logger.info(`Found league: ${league.name}, teams: ${league.teams.length}, scheduleGenerated: ${league.scheduleGenerated}`);
  
  if (league.teams.length < 2) {
    logger.error(`Not enough teams: ${league.teams.length}`);
    throw new Error('League must have at least 2 teams to generate a schedule');
  }
  
  if (league.scheduleGenerated) {
    logger.error('Schedule already generated for this league');
    throw new Error('Schedule has already been generated for this league');
  }
  
  // Log team IDs for debugging
  const teamIds = league.teams.map(team => team.toString());
  logger.info(`Team IDs: ${JSON.stringify(teamIds)}`);
  
  // Generate the schedule
  logger.info('Generating match data');
  const matchData = await generateRoundRobinSchedule(
    leagueId,
    league.teams,
    league.startDate,
    league.endDate,
    league.venue
  );
  
  // Create the matches in the database
  logger.info(`Inserting ${matchData.length} matches into database`);
  try {
    const createdMatches = await MatchModel.insertMany(matchData);
    logger.info(`Successfully created ${createdMatches.length} matches`);
    
    // Update the league to mark schedule as generated
    league.scheduleGenerated = true;
    await league.save();
    logger.info(`Updated league ${leagueId} scheduleGenerated flag to true`);
    
    return createdMatches;
  } catch (error) {
    logger.error('Error creating matches:', error);
    throw error;
  }
}
