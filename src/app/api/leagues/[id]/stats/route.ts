import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel, MatchModel, TeamModel, PlayerModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// Helper function to calculate stats with proper error handling
async function calculateLeagueStats(leagueId) {
  return withConnection(async () => {
    console.log('Calculating stats for league:', leagueId);
    
    // Get the league details
    const league = await LeagueModel.findById(leagueId);
    if (!league) {
      throw new Error('League not found');
    }
    
    console.log('Found league:', league.name);
    
    // Get all matches for the league
    const matches = await MatchModel.find({ league: leagueId })
      .populate('teamA', 'name players')
      .populate('teamB', 'name players');
    
    console.log(`Found ${matches.length} matches`);
    
    // Get all teams in the league
    const teams = await TeamModel.find({ _id: { $in: league.teams } })
      .populate('players');
    
    console.log(`Found ${teams.length} teams`);
    
    // Calculate basic stats
    const totalMatches = matches.length;
    const completedMatches = matches.filter(match => match.status === 'completed').length;
    const completionPercentage = totalMatches > 0 
      ? Math.round((completedMatches / totalMatches) * 100) 
      : 0;
    
    // Count active players (those who have played at least one match)
    const playedPlayerIds = new Set();
    const teamToMatchesMap = {};
    const teamToWinsMap = {};
    const teamToLossesMap = {};
    
    let totalSets = 0;
    let totalSetScores = 0;
    const scoreFrequency = {};
    
    const matchTypes = {
      decisive: 0, // One team wins by more than 3 points
      close: 0,    // Difference less than 3 points
      tiebreak: 0  // Went to the 3rd set
    };
    
    const setsDistribution = {
      twoSets: 0,
      threeSets: 0
    };
    
    // Process completed matches
    const completedMatchesData = matches.filter(match => match.status === 'completed');
    console.log(`Found ${completedMatchesData.length} completed matches`);
    
    completedMatchesData.forEach(match => {
      const teamA = match.teamA;
      const teamB = match.teamB;
      
      // Record players who played
      if (teamA && teamA.players) {
        teamA.players.forEach(player => {
          if (player) playedPlayerIds.add(player.toString());
        });
      }
      if (teamB && teamB.players) {
        teamB.players.forEach(player => {
          if (player) playedPlayerIds.add(player.toString());
        });
      }
      
      // Record team stats
      if (teamA) {
        const teamAId = teamA._id.toString();
        teamToMatchesMap[teamAId] = (teamToMatchesMap[teamAId] || 0) + 1;
      }
      if (teamB) {
        const teamBId = teamB._id.toString();
        teamToMatchesMap[teamBId] = (teamToMatchesMap[teamBId] || 0) + 1;
      }
      
      // Process match results
      if (match.result && match.result.teamAScore && match.result.teamBScore) {
        // Count total sets
        const numSets = match.result.teamAScore.length;
        totalSets += numSets;
        
        // Count sets by number (2 or 3)
        if (numSets === 2) {
          setsDistribution.twoSets++;
        } else if (numSets === 3) {
          setsDistribution.threeSets++;
        }
        
        // Record common scores
        const scoreKey = match.result.teamAScore.map((score, index) => 
          `${score}-${match.result.teamBScore[index]}`
        ).join(', ');
        scoreFrequency[scoreKey] = (scoreFrequency[scoreKey] || 0) + 1;
        
        // Determine winner and match type
        if (match.result.winner) {
          // Record win/loss
          const winnerId = match.result.winner.toString();
          const loserId = teamA && teamA._id.toString() === winnerId && teamB
            ? teamB._id.toString() 
            : (teamA ? teamA._id.toString() : null);
            
          if (winnerId) teamToWinsMap[winnerId] = (teamToWinsMap[winnerId] || 0) + 1;
          if (loserId) teamToLossesMap[loserId] = (teamToLossesMap[loserId] || 0) + 1;
          
          // Determine match type
          try {
            const teamAPoints = match.result.teamAScore.reduce((sum, score) => sum + score, 0);
            const teamBPoints = match.result.teamBScore.reduce((sum, score) => sum + score, 0);
            const pointDifference = Math.abs(teamAPoints - teamBPoints);
            
            if (numSets === 3) {
              matchTypes.tiebreak++;
            } else if (pointDifference > 3) {
              matchTypes.decisive++;
            } else {
              matchTypes.close++;
            }
            
            // Calculate set scores
            for (let i = 0; i < numSets; i++) {
              totalSetScores += match.result.teamAScore[i] + match.result.teamBScore[i];
            }
          } catch (error) {
            console.error('Error processing match type:', error);
          }
        }
      }
    });
    
    // Calculate most common score
    let mostCommonScore = 'N/A';
    let maxFrequency = 0;
    for (const [score, frequency] of Object.entries(scoreFrequency)) {
      if (frequency > maxFrequency) {
        mostCommonScore = score;
        maxFrequency = frequency;
      }
    }
    
    // Calculate percentages for sets distribution
    if (completedMatchesData.length > 0) {
      setsDistribution.twoSets = Math.round((setsDistribution.twoSets / completedMatchesData.length) * 100);
      setsDistribution.threeSets = Math.round((setsDistribution.threeSets / completedMatchesData.length) * 100);
    }
    
    // Get top performing teams
    const topTeams = teams.map(team => {
        const teamId = team._id.toString();
        const wins = teamToWinsMap[teamId] || 0;
        const losses = teamToLossesMap[teamId] || 0;
        const totalMatches = wins + losses;
        const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
        
        return {
          id: teamId,
          name: team.name,
          wins,
          losses,
          winRate,
          totalMatches
        };
      })
      .sort((a, b) => {
        // Sort by win rate first, then by total matches played
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalMatches - a.totalMatches;
      })
      .slice(0, 5); // Get top 5
    
    // Calculate matches this week and last week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    const matchesThisWeek = matches.filter(match => {
      if (!match.scheduledDate) return false;
      const matchDate = new Date(match.scheduledDate);
      return matchDate >= startOfWeek && matchDate < now;
    }).length;
    
    const matchesLastWeek = matches.filter(match => {
      if (!match.scheduledDate) return false;
      const matchDate = new Date(match.scheduledDate);
      return matchDate >= startOfLastWeek && matchDate < startOfWeek;
    }).length;
    
    // Calculate days remaining in the league
    const daysRemaining = league.endDate 
      ? Math.max(0, Math.ceil((new Date(league.endDate) - now) / (1000 * 60 * 60 * 24)))
      : 0;
    
    // Calculate average points per team
    let totalPoints = 0;
    teams.forEach(team => {
      const teamId = team._id.toString();
      totalPoints += (teamToWinsMap[teamId] || 0) * 3; // Assuming 3 points per win
    });
    const averagePoints = teams.length > 0 ? totalPoints / teams.length : 0;
    
    // Count total players across all teams
    const totalPlayers = teams.reduce((count, team) => {
      return count + (team.players?.length || 0);
    }, 0);
    
    return {
      // General stats
      totalMatches,
      completedMatches,
      completionPercentage,
      totalPlayers,
      activePlayers: playedPlayerIds.size,
      participationRate: totalPlayers > 0 
        ? Math.round((playedPlayerIds.size / totalPlayers) * 100) 
        : 0,
      
      // Match stats
      averageSetsPerMatch: completedMatchesData.length > 0 
        ? totalSets / completedMatchesData.length 
        : 0,
      mostCommonScore,
      matchTypes,
      setsDistribution,
      
      // Time-based stats
      matchesThisWeek,
      matchesLastWeek,
      daysRemaining,
      
      // Team performance
      topTeams,
      averagePoints,
      
      // Meta info
      leagueName: league.name,
      generatedAt: new Date().toISOString()
    };
  });
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {    
    const leagueId = params.id;
    
    // Calculate league statistics
    const stats = await calculateLeagueStats(leagueId);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching league stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league statistics', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}