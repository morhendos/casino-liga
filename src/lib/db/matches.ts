/**
 * Matches database operations
 */

import { Types } from 'mongoose';
import { getConnection } from './simplified-connection';
import { handleDatabaseError } from './error-handler';
import { MatchModel } from '@/models/match';

/**
 * Get matches for a specific league
 * 
 * @param leagueId The league ID
 * @returns Array of match documents
 */
export async function getLeagueMatches(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await MatchModel.find({ league: new Types.ObjectId(leagueId) })
      .populate('teamA teamB', 'name')
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching matches for league ${leagueId}`);
  }
}

/**
 * Get public matches for a specific league
 * Used for public league views
 * 
 * @param leagueId The league ID
 * @returns Array of match documents with limited fields
 */
export async function getPublicLeagueMatches(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await MatchModel.find({ league: new Types.ObjectId(leagueId) })
      .populate('teamA teamB', 'name')
      .select('teamA teamB scheduledDate scheduledTime location status result')
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching public matches for league ${leagueId}`);
  }
}

/**
 * Get completed matches for a specific league
 * 
 * @param leagueId The league ID
 * @returns Array of completed match documents
 */
export async function getCompletedLeagueMatches(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await MatchModel.find({ 
      league: new Types.ObjectId(leagueId),
      status: 'completed'
    })
      .populate('teamA teamB', 'name')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching completed matches for league ${leagueId}`);
  }
}

/**
 * Get upcoming matches for a specific league
 * 
 * @param leagueId The league ID
 * @returns Array of upcoming match documents
 */
export async function getUpcomingLeagueMatches(leagueId: string): Promise<any[]> {
  try {
    await getConnection();
    
    return await MatchModel.find({ 
      league: new Types.ObjectId(leagueId),
      status: { $in: ['scheduled', 'unscheduled'] }
    })
      .populate('teamA teamB', 'name')
      .sort({ scheduledDate: 1, createdAt: 1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching upcoming matches for league ${leagueId}`);
  }
}
