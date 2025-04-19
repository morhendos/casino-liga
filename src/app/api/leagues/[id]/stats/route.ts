import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { LeagueModel, MatchModel, TeamModel, PlayerModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to calculate stats
async function calculateLeagueStats(leagueId) {
  // Get the league details
  const league = await LeagueModel.findById(leagueId);
  if (!league) {
    throw new Error('League not found');
  }
  
  // Get all matches for the league
  const matches = await MatchModel.find({ leagueId }).populate('homeTeam awayTeam');
  
  // Get all teams in the league
  const teams = await TeamModel.find({ _id: { $in: league.teams } }).populate('players');
  
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
  
  completedMatchesData.forEach(match => {
    // Record players who played
    if (match.homeTeam && match.homeTeam.players) {
      match.homeTeam.players.forEach(player => playedPlayerIds.add(player.toString()));
    }
    if (match.awayTeam && match.awayTeam.players) {
      match.awayTeam.players.forEach(player => playedPlayerIds.add(player.toString()));
    }
    
    // Record team stats
    if (match.homeTeam) {
      const homeTeamId = match.homeTeam._id.toString();
      teamToMatchesMap[homeTeamId] = (teamToMatchesMap[homeTeamId] || 0) + 1;
    }
    if (match.awayTeam) {
      const awayTeamId = match.awayTeam._id.toString();
      teamToMatchesMap[awayTeamId] = (teamToMatchesMap[awayTeamId] || 0) + 1;
    }
    
    // Process match result data if available
    if (match.sets && match.sets.length > 0) {
      // Count total sets
      totalSets += match.sets.length;
      
      // Count sets by number (2 or 3)
      if (match.sets.length === 2) {
        setsDistribution.twoSets++;
      } else if (match.sets.length === 3) {
        setsDistribution.threeSets++;
      }
      
      // Record common scores
      const scoreKey = match.sets.map(set => `${set.homeScore}-${set.awayScore}`).join(', ');
      scoreFrequency[scoreKey] = (scoreFrequency[scoreKey] || 0) + 1;
      
      // Determine winner and match type
      if (match.winner) {
        // Record win/loss
        const winnerId = match.winner.toString();
        const loserId = match.homeTeam._id.toString() === winnerId 
          ? match.awayTeam._id.toString() 
          : match.homeTeam._id.toString();
          
        teamToWinsMap[winnerId] = (teamToWinsMap[winnerId] || 0) + 1;
        teamToLossesMap[loserId] = (teamToLossesMap[loserId] || 0) + 1;
        
        // Determine match type
        const homePoints = match.sets.reduce((sum, set) => sum + set.homeScore, 0);
        const awayPoints = match.sets.reduce((sum, set) => sum + set.awayScore, 0);
        const pointDifference = Math.abs(homePoints - awayPoints);
        
        if (match.sets.length === 3) {
          matchTypes.tiebreak++;
        } else if (pointDifference > 3) {
          matchTypes.decisive++;
        } else {
          matchTypes.close++;
        }
        
        // Calculate set scores
        match.sets.forEach(set => {
          totalSetScores += set.homeScore + set.awayScore;
        });
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
  const topTeams = teams
    .map(team => {
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
    const matchDate = new Date(match.scheduledDate);
    return matchDate >= startOfWeek && matchDate < now;
  }).length;
  
  const matchesLastWeek = matches.filter(match => {
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
  
  return {
    // General stats
    totalMatches,
    completedMatches,
    completionPercentage,
    totalPlayers: teams.reduce((count, team) => count + team.players.length, 0),
    activePlayers: playedPlayerIds.size,
    participationRate: teams.reduce((count, team) => count + team.players.length, 0) > 0 
      ? Math.round((playedPlayerIds.size / teams.reduce((count, team) => count + team.players.length, 0)) * 100) 
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
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const leagueId = params.id;
    const session = await getServerSession(authOptions);
    
    // Check if league exists
    const league = await LeagueModel.findById(leagueId);
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }
    
    // Calculate league statistics
    const stats = await calculateLeagueStats(leagueId);
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching league stats:', error);
    return NextResponse.json({ error: 'Failed to fetch league statistics', message: error.message }, { status: 500 });
  }
}
