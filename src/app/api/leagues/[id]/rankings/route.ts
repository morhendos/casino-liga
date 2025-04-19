import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel, RankingModel } from '@/models';
import { createLogger } from '@/lib/logger';

const logger = createLogger('RankingsAPI');

// GET /api/leagues/[id]/rankings - Get the rankings for a league
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`GET rankings request for league: ${params.id}`);
  
  try {
    const leagueId = params.id;
    
    const rankings = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      logger.info(`Fetching rankings for league: ${league.name}`);
      
      // Get all rankings for this league, sorted by points (descending)
      const rankings = await RankingModel.find({ league: leagueId })
        .sort({ points: -1, wins: -1 })
        .populate({
          path: 'team',
          select: 'name'
        });
      
      if (rankings.length === 0) {
        logger.info(`No rankings found for league: ${leagueId}`);
        return [];
      }
      
      // Calculate previous positions
      // For simplicity, we'll use a separate sort based only on points
      // In a real app, you might store previous rankings periodically
      const previousPositions = [...rankings]
        .sort((a, b) => {
          // Assuming points changes recently, we subtract a random small value
          // This is just a simulation of previous positions
          const aPoints = a.points - (a.points > 0 ? 1 : 0);
          const bPoints = b.points - (b.points > 0 ? 1 : 0);
          
          if (aPoints !== bPoints) return bPoints - aPoints;
          if (a.wins !== b.wins) return b.wins - a.wins;
          return 0;
        })
        .reduce((acc, ranking, index) => {
          acc[ranking._id.toString()] = index + 1;
          return acc;
        }, {});
      
      // Add position and previousPosition to each ranking
      return rankings.map((ranking, index) => {
        const rankingObj = ranking.toObject();
        rankingObj.position = index + 1;
        rankingObj.previousPosition = previousPositions[ranking._id.toString()];
        return rankingObj;
      });
    });
    
    return NextResponse.json(rankings);
  } catch (error) {
    logger.error('Error fetching league rankings:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch league rankings' },
      { status: 500 }
    );
  }
}

// POST /api/leagues/[id]/rankings/recalculate - Force recalculate rankings
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.info(`POST rankings recalculation request for league: ${params.id}`);
  
  try {
    const leagueId = params.id;
    
    const results = await withConnection(async () => {
      // Check if league exists
      const league = await LeagueModel.findById(leagueId);
      
      if (!league) {
        logger.error(`League not found: ${leagueId}`);
        throw new Error('League not found');
      }
      
      logger.info(`Recalculating rankings for league: ${league.name}`);
      
      // First, clear existing rankings
      await RankingModel.deleteMany({ league: leagueId });
      
      // Get all completed matches for this league
      const MatchModel = (await import('@/models')).MatchModel;
      const matches = await MatchModel.find({ 
        league: leagueId,
        status: 'completed',
        result: { $exists: true }
      });
      
      logger.info(`Found ${matches.length} completed matches to process`);
      
      if (matches.length === 0) {
        return { message: 'No completed matches found to calculate rankings' };
      }
      
      // Create a map to hold team rankings data
      const rankingsMap = new Map();
      
      // Process each match to calculate team statistics
      for (const match of matches) {
        const teamAId = match.teamA.toString();
        const teamBId = match.teamB.toString();
        const winnerId = match.result.winner.toString();
        
        // Initialize team rankings if not yet in the map
        if (!rankingsMap.has(teamAId)) {
          rankingsMap.set(teamAId, {
            league: leagueId,
            team: teamAId,
            points: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            setsWon: 0,
            setsLost: 0,
            pointsScored: 0,
            pointsConceded: 0
          });
        }
        
        if (!rankingsMap.has(teamBId)) {
          rankingsMap.set(teamBId, {
            league: leagueId,
            team: teamBId,
            points: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            setsWon: 0,
            setsLost: 0,
            pointsScored: 0,
            pointsConceded: 0
          });
        }
        
        // Get team ranking objects
        const teamARanking = rankingsMap.get(teamAId);
        const teamBRanking = rankingsMap.get(teamBId);
        
        // Update matches played
        teamARanking.matchesPlayed += 1;
        teamBRanking.matchesPlayed += 1;
        
        // Update wins, losses, and points
        if (winnerId === teamAId) {
          teamARanking.wins += 1;
          teamARanking.points += (league.pointsPerWin || 3);
          teamBRanking.losses += 1;
          teamBRanking.points += (league.pointsPerLoss || 0);
        } else {
          teamBRanking.wins += 1;
          teamBRanking.points += (league.pointsPerWin || 3);
          teamARanking.losses += 1;
          teamARanking.points += (league.pointsPerLoss || 0);
        }
        
        // Update sets statistics if available
        if (match.result.teamAScore && match.result.teamBScore) {
          let teamASetsWon = 0;
          let teamBSetsWon = 0;
          
          // Count set wins
          for (let i = 0; i < match.result.teamAScore.length; i++) {
            if (match.result.teamAScore[i] > match.result.teamBScore[i]) {
              teamASetsWon++;
            } else if (match.result.teamBScore[i] > match.result.teamAScore[i]) {
              teamBSetsWon++;
            }
          }
          
          teamARanking.setsWon += teamASetsWon;
          teamARanking.setsLost += teamBSetsWon;
          teamBRanking.setsWon += teamBSetsWon;
          teamBRanking.setsLost += teamASetsWon;
          
          // Sum up points scored in sets
          const teamAPointsScored = match.result.teamAScore.reduce((sum, score) => sum + score, 0);
          const teamBPointsScored = match.result.teamBScore.reduce((sum, score) => sum + score, 0);
          
          teamARanking.pointsScored += teamAPointsScored;
          teamARanking.pointsConceded += teamBPointsScored;
          teamBRanking.pointsScored += teamBPointsScored;
          teamBRanking.pointsConceded += teamAPointsScored;
        }
      }
      
      // Create new ranking documents
      const rankingsToCreate = Array.from(rankingsMap.values());
      
      const createdRankings = await RankingModel.insertMany(rankingsToCreate);
      
      logger.info(`Created ${createdRankings.length} ranking entries`);
      
      return { 
        message: `Rankings recalculated successfully for ${createdRankings.length} teams`,
        teamsProcessed: createdRankings.length,
        matchesProcessed: matches.length
      };
    });
    
    return NextResponse.json(results);
  } catch (error) {
    logger.error('Error recalculating league rankings:', error);
    
    if (error instanceof Error && error.message === 'League not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to recalculate league rankings' },
      { status: 500 }
    );
  }
}
