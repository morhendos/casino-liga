/**
 * League database operations
 */

import { LeagueModel, type LeagueDocument } from '@/models/league';
import { getConnection } from './simplified-connection';
import { handleDatabaseError } from './error-handler';
import { Types } from 'mongoose';

/**
 * Fetch a league by ID
 * 
 * @param id The league ID
 * @returns League document or null if not found
 */
export async function getLeagueById(id: string): Promise<LeagueDocument | null> {
  try {
    await getConnection();
    return await LeagueModel.findById(id);
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching league with ID ${id}`);
  }
}

/**
 * Fetch a league by ID with populated fields
 * 
 * @param id The league ID
 * @returns League document with populated fields or null if not found
 */
export async function getLeagueByIdPopulated(id: string): Promise<LeagueDocument | null> {
  try {
    await getConnection();
    return await LeagueModel.findById(id)
      .populate('organizer', 'name email')
      .populate({
        path: 'teams',
        populate: {
          path: 'players',
          model: 'Player'
        }
      });
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching populated league with ID ${id}`);
  }
}

/**
 * Fetch a public league by ID 
 * Used for public views that don't require authentication
 * 
 * @param id The league ID
 * @returns League document or null if not found
 */
export async function getPublicLeagueById(id: string): Promise<Record<string, any> | null> {
  try {
    await getConnection();
    
    // Only return public leagues with specific fields
    return await LeagueModel.findOne({ 
        _id: new Types.ObjectId(id),
        isPublic: true 
      })
      .select('name description startDate endDate venue status banner matchFormat pointsPerWin pointsPerLoss')
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, `Error fetching public league with ID ${id}`);
  }
}

/**
 * Fetch all public leagues
 * Used for the public leagues directory
 * 
 * @returns Array of leagues
 */
export async function getPublicLeagues(): Promise<Record<string, any>[]> {
  try {
    await getConnection();
    
    // Only return active public leagues with specific fields
    return await LeagueModel.find({ 
        isPublic: true,
        status: { $in: ['registration', 'active', 'completed'] }
      })
      .select('name description startDate endDate venue status banner')
      .sort({ startDate: -1 })
      .lean();
  } catch (error) {
    throw handleDatabaseError(error, 'Error fetching public leagues');
  }
}
