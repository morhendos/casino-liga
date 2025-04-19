import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { PlayerModel, TeamModel, MatchModel, LeagueModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to calculate player stats
async function calculatePlayerStats(playerId, leagueId = null) {
  return withConnection(async () => {
    // Get the player
    const player = await PlayerModel.findById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    
    // Find teams the player is a member of
    const teams = await TeamModel.find({ players: playerId });
    const teamIds = teams.map(team => team._id);
    
    // Find matches for these teams, optionally filtered by league
    const matchQuery: any = {
      $or: [
        { teamA: { $in: teamIds } },
        { teamB: { $in: teamIds } }
      ],
      status: 'completed' // Only include completed matches
    };
    
    // Add league filter if specified
    if (leagueId) {
      matchQuery.league = leagueId;
    }
    
    const matches = await MatchModel.find(matchQuery)
      .populate('teamA teamB')
      .sort({ scheduledDate: -1 }); // Most recent first
    
    // Calculate basic stats
    let wins = 0;
    let losses = 0;
    let setsWon = 0;
    let totalSets = 0;
    let lastFiveMatches = [];
    let consecutiveWins = 0;
    let bestScore = '';
    let bestScoreDiff = -1; // Track the most dominant win
    
    // Process matches
    matches.forEach(match => {
      const playerTeamId = teamIds.find(
        id => id.equals(match.teamA._id) || id.equals(match.teamB._id)
      );
      
      if (!playerTeamId || !match.result) return; // Skip if player's team not found in match or no result
      
      const isTeamA = playerTeamId.equals(match.teamA._id);
      const isWinner = match.result.winner && match.result.winner.equals(playerTeamId);
      
      // Record win/loss
      if (isWinner) {
        wins++;
        lastFiveMatches.push('W');
      } else {
        losses++;
        lastFiveMatches.push('L');
      }
      
      // Count sets won and total sets
      if (match.result.teamAScore && match.result.teamAScore.length > 0) {
        match.result.teamAScore.forEach((score, idx) => {
          totalSets++;
          
          const playerTeamScore = isTeamA ? score : match.result.teamBScore[idx];
          const opponentScore = isTeamA ? match.result.teamBScore[idx] : score;
          
          if (playerTeamScore > opponentScore) {
            setsWon++;
          }
          
          // Check for best score
          const scoreDiff = playerTeamScore - opponentScore;
          if (scoreDiff > bestScoreDiff) {
            bestScoreDiff = scoreDiff;
            bestScore = `${playerTeamScore}-${opponentScore}`;
          }
        });
      }
    });
    
    // Limit to last 5 matches and reverse to show most recent last
    lastFiveMatches = lastFiveMatches.slice(0, 5).reverse();
    
    // Calculate consecutive wins
    for (let i = 0; i < lastFiveMatches.length; i++) {
      if (lastFiveMatches[i] === 'W') {
        consecutiveWins++;
      } else {
        break;
      }
    }
    
    // Calculate win percentage
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    
    // Calculate sets won percentage
    const setsWonPercentage = totalSets > 0 ? Math.round((setsWon / totalSets) * 100) : 0;
    
    // Calculate league average win rate for comparison
    let leagueAvgWinRate = 50; // Default value
    
    if (leagueId) {
      // If a specific league is selected, calculate the average for that league
      const league = await LeagueModel.findById(leagueId);
      if (league) {
        const allTeamsInLeague = await TeamModel.find({ _id: { $in: league.teams } });
        const allTeamIds = allTeamsInLeague.map(team => team._id);
        
        const allLeagueMatches = await MatchModel.find({
          league: leagueId,
          status: 'completed',
          $or: [
            { teamA: { $in: allTeamIds } },
            { teamB: { $in: allTeamIds } }
          ]
        });
        
        const teamStats = {};
        
        allLeagueMatches.forEach(match => {
          if (match.result && match.result.winner) {
            const winnerId = match.result.winner.toString();
            const teamAId = match.teamA.toString();
            const teamBId = match.teamB.toString();
            
            // Initialize team stats if needed
            if (!teamStats[teamAId]) teamStats[teamAId] = { wins: 0, matches: 0 };
            if (!teamStats[teamBId]) teamStats[teamBId] = { wins: 0, matches: 0 };
            
            // Record win for winner
            teamStats[winnerId].wins++;
            
            // Record match for both teams
            teamStats[teamAId].matches++;
            teamStats[teamBId].matches++;
          }
        });
        
        // Calculate average win rate across all teams
        let totalWinRate = 0;
        let teamsWithMatches = 0;
        
        for (const teamId in teamStats) {
          const team = teamStats[teamId];
          if (team.matches > 0) {
            totalWinRate += (team.wins / team.matches) * 100;
            teamsWithMatches++;
          }
        }
        
        if (teamsWithMatches > 0) {
          leagueAvgWinRate = Math.round(totalWinRate / teamsWithMatches);
        }
      }
    }
    
    // Calculate win rate trend (simplified)
    let winRateTrend = 0;
    
    if (lastFiveMatches.length >= 3) {
      const recentWins = lastFiveMatches.slice(0, 3).filter(result => result === 'W').length;
      const recentWinRate = (recentWins / 3) * 100;
      
      // Earlier matches (if available)
      const earlierMatches = matches.slice(3, 6);
      if (earlierMatches.length >= 3) {
        const earlierWins = earlierMatches.filter(match => {
          if (!match.result || !match.result.winner) return false;
          
          const playerTeamId = teamIds.find(
            id => id.equals(match.teamA._id) || id.equals(match.teamB._id)
          );
          return match.result.winner && playerTeamId && match.result.winner.equals(playerTeamId);
        }).length;
        
        const earlierWinRate = (earlierWins / 3) * 100;
        winRateTrend = Math.round(recentWinRate - earlierWinRate);
      }
    }
    
    // Calculate average score
    let averageScore = 'N/A';
    if (totalSets > 0) {
      let totalPlayerPoints = 0;
      let totalOpponentPoints = 0;
      
      matches.forEach(match => {
        if (!match.result || !match.result.teamAScore) return;
        
        const playerTeamId = teamIds.find(
          id => id.equals(match.teamA._id) || id.equals(match.teamB._id)
        );
        if (!playerTeamId) return;
        
        const isTeamA = playerTeamId.equals(match.teamA._id);
        
        match.result.teamAScore.forEach((score, idx) => {
          const playerTeamScore = isTeamA ? score : match.result.teamBScore[idx];
          const opponentScore = isTeamA ? match.result.teamBScore[idx] : score;
          
          totalPlayerPoints += playerTeamScore;
          totalOpponentPoints += opponentScore;
        });
      });
      
      const avgPlayerPoints = (totalPlayerPoints / totalSets).toFixed(1);
      const avgOpponentPoints = (totalOpponentPoints / totalSets).toFixed(1);
      averageScore = `${avgPlayerPoints}-${avgOpponentPoints}`;
    }
    
    return {
      playerName: player.nickname,
      wins,
      losses,
      totalMatches,
      winRate,
      setsWon,
      totalSets,
      setsWonPercentage,
      leagueAvgWinRate,
      winRateTrend,
      lastFiveMatches,
      consecutiveWins,
      bestScore: bestScore || 'N/A',
      averageScore,
      teams: teams.map(team => ({
        id: team._id,
        name: team.name
      })),
      generatedAt: new Date().toISOString()
    };
  });
}

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id;
    
    // Get the optional leagueId from query parameters
    const url = new URL(request.url);
    const leagueId = url.searchParams.get('leagueId');
    
    // Check if player exists - this will throw if not found
    const stats = await calculatePlayerStats(playerId, leagueId);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player statistics', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}