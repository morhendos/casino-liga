/**
 * Rankings database operations
 */

import { Types } from 'mongoose';
import { getConnection } from './simplified-connection';
import { handleDatabaseError } from './error-handler';
import { RankingModel } from '@/models/ranking';

/**
 * Get rankings for a specific league
 * 
 * @param leagueId The league ID
 * @returns Array of ranking documents
 */
export async function getLeagueRankings(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await RankingModel.find({ league: new Types.ObjectId(leagueId) })
      .populate('team', 'name')
      .sort({ points: -1, matchesWon: -1, setsWon: -1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching rankings for league ${leagueId}`);
  }
}

/**
 * Get public rankings for a specific league
 * Used for public league views
 * 
 * @param leagueId The league ID
 * @returns Array of ranking documents with limited fields
 */
export async function getPublicLeagueRankings(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await RankingModel.find({ league: new Types.ObjectId(leagueId) })
      .populate('team', 'name')
      .select('team points matchesPlayed matchesWon matchesLost setsWon setsLost')
      .sort({ points: -1, matchesWon: -1, setsWon: -1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching public rankings for league ${leagueId}`);
  }
}

/**
 * Get ranking for a specific team in a league
 * 
 * @param leagueId The league ID
 * @param teamId The team ID
 * @returns Ranking document or null if not found
 */
export async function getTeamRanking(leagueId: string, teamId: string): Promise<any | null> {
  try {
    await getConnection();
    
    return await RankingModel.findOne({
      league: new Types.ObjectId(leagueId),
      team: new Types.ObjectId(teamId)
    }).lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching ranking for team ${teamId} in league ${leagueId}`);
  }
}
