import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { LeagueModel, MatchModel, TeamModel, PlayerModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to calculate stats with proper error handling
async function calculateLeagueStats(leagueId) {
  try {
    // Get the league details
    const league = await LeagueModel.findById(leagueId);
    if (!league) {
      throw new Error('League not found');
    }
    
    // Get all matches for the league (if any exist)
    const matches = await MatchModel.find({ leagueId }).populate('homeTeam awayTeam').lean();
    
    // Get all teams in the league (if any exist)
    const teams = league.teams?.length 
      ? await TeamModel.find({ _id: { $in: league.teams } }).populate('players').lean()
      : [];
    
    // Calculate basic stats with safe defaults
    const totalMatches = matches?.length || 0;
    const completedMatches = matches?.filter(match => match?.status === 'completed')?.length || 0;
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
    
    // Process completed matches if there are any
    const completedMatchesData = matches?.filter(match => match?.status === 'completed') || [];
    
    completedMatchesData.forEach(match => {
      // Record players who played (if team data is available)
      if (match.homeTeam && match.homeTeam.players) {
        match.homeTeam.players.forEach(player => {
          if (player) playedPlayerIds.add(player.toString());
        });
      }
      if (match.awayTeam && match.awayTeam.players) {
        match.awayTeam.players.forEach(player => {
          if (player) playedPlayerIds.add(player.toString());
        });
      }
      
      // Record team stats
      if (match.homeTeam && match.homeTeam._id) {
        const homeTeamId = match.homeTeam._id.toString();
        teamToMatchesMap[homeTeamId] = (teamToMatchesMap[homeTeamId] || 0) + 1;
      }
      if (match.awayTeam && match.awayTeam._id) {
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
        const scoreKey = match.sets.map(set => 
          `${set.homeScore || 0}-${set.awayScore || 0}`
        ).join(', ');
        scoreFrequency[scoreKey] = (scoreFrequency[scoreKey] || 0) + 1;
        
        // Determine winner and match type
        if (match.winner) {
          // Record win/loss
          const winnerId = match.winner.toString();
          const loserId = match.homeTeam && match.homeTeam._id.toString() === winnerId && match.awayTeam
            ? match.awayTeam._id.toString() 
            : (match.homeTeam ? match.homeTeam._id.toString() : null);
            
          if (winnerId) teamToWinsMap[winnerId] = (teamToWinsMap[winnerId] || 0) + 1;
          if (loserId) teamToLossesMap[loserId] = (teamToLossesMap[loserId] || 0) + 1;
          
          // Determine match type
          try {
            const homePoints = match.sets.reduce((sum, set) => sum + (set.homeScore || 0), 0);
            const awayPoints = match.sets.reduce((sum, set) => sum + (set.awayScore || 0), 0);
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
              totalSetScores += (set.homeScore || 0) + (set.awayScore || 0);
            });
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
  } catch (error) {
    console.error('Error calculating league stats:', error);
    throw error;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connect();
    
    const leagueId = params.id;
    
    // Check if league exists
    const league = await LeagueModel.findById(leagueId);
    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }
    
    // Return mock data for initial testing
    const mockData = {
      completionPercentage: 65,
      completedMatches: 13,
      totalMatches: 20,
      participationRate: 90,
      activePlayers: 18,
      totalPlayers: 20,
      averageSetsPerMatch: 2.4,
      mostCommonScore: "6-4, 6-3",
      matchesThisWeek: 3,
      matchesLastWeek: 4,
      averagePoints: 6.5,
      daysRemaining: 14,
      matchTypes: {
        decisive: 7,
        close: 4,
        tiebreak: 2
      },
      setsDistribution: {
        twoSets: 62,
        threeSets: 38
      },
      topTeams: [
        { id: "1", name: "Team Alpha", wins: 5, losses: 0, winRate: 100, totalMatches: 5 },
        { id: "2", name: "Team Beta", wins: 4, losses: 1, winRate: 80, totalMatches: 5 },
        { id: "3", name: "Team Gamma", wins: 3, losses: 2, winRate: 60, totalMatches: 5 },
        { id: "4", name: "Team Delta", wins: 1, losses: 4, winRate: 20, totalMatches: 5 },
        { id: "5", name: "Team Epsilon", wins: 0, losses: 5, winRate: 0, totalMatches: 5 }
      ]
    };
    
    return NextResponse.json({ stats: mockData });
    
    // Uncomment below to use real data calculation once the bugs are fixed
    /*
    // Calculate league statistics
    const stats = await calculateLeagueStats(leagueId);
    
    return NextResponse.json({ stats });
    */
  } catch (error) {
    console.error('Error fetching league stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league statistics', message: error.message }, 
      { status: 500 }
    );
  }
}
