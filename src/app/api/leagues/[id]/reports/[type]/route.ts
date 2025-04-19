import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import { LeagueModel, TeamModel, MatchModel, PlayerModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole } from '@/lib/auth/role-utils';
import { ROLES } from '@/lib/auth/role-utils';

// Helper function to generate CSV content
function generateCSV(rows) {
  // Add headers as the first row
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map(row => {
      return headers.map(header => {
        // Handle values that might contain commas by wrapping in quotes
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',');
    })
  ];
  
  return csvRows.join('\n');
}

// Function to generate a teams report
async function generateTeamsReport(leagueId, format) {
  const league = await LeagueModel.findById(leagueId);
  if (!league) throw new Error('League not found');
  
  const teams = await TeamModel.find({ _id: { $in: league.teams } })
    .populate('players');
  
  // Create rows for the report
  const rows = [];
  
  for (const team of teams) {
    // Get match data for this team
    const matches = await MatchModel.find({
      leagueId,
      $or: [
        { homeTeam: team._id },
        { awayTeam: team._id }
      ]
    });
    
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const wins = matches.filter(m => m.winner && m.winner.equals(team._id)).length;
    
    // Create player info string
    const playerInfo = team.players
      .map(player => player.nickname)
      .join(', ');
    
    rows.push({
      TeamName: team.name,
      Players: playerInfo,
      TotalMatches: totalMatches,
      CompletedMatches: completedMatches,
      Wins: wins,
      WinPercentage: completedMatches > 0 ? Math.round((wins / completedMatches) * 100) : 0,
      ParticipationRate: totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0
    });
  }
  
  // Generate the appropriate format
  if (format === 'csv') {
    return {
      content: generateCSV(rows),
      contentType: 'text/csv',
      filename: `${league.name.replace(/\s+/g, '-')}-teams-report.csv`
    };
  }
  
  // For other formats, we'd need to implement conversion
  throw new Error(`Format '${format}' not implemented yet`);
}

// Function to generate a schedule report
async function generateScheduleReport(leagueId, format) {
  const league = await LeagueModel.findById(leagueId);
  if (!league) throw new Error('League not found');
  
  const matches = await MatchModel.find({ leagueId })
    .populate('homeTeam awayTeam')
    .sort({ scheduledDate: 1 });
  
  // Create rows for the report
  const rows = matches.map(match => {
    const date = match.scheduledDate 
      ? new Date(match.scheduledDate).toLocaleDateString() 
      : 'Not scheduled';
    
    const time = match.scheduledDate 
      ? new Date(match.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : '';
    
    return {
      Date: date,
      Time: time,
      Location: match.venue || 'TBD',
      HomeTeam: match.homeTeam ? match.homeTeam.name : 'TBD',
      AwayTeam: match.awayTeam ? match.awayTeam.name : 'TBD',
      Status: match.status.charAt(0).toUpperCase() + match.status.slice(1),
      Result: match.status === 'completed' 
        ? `${match.sets.map(s => `${s.homeScore}-${s.awayScore}`).join(', ')}` 
        : ''
    };
  });
  
  // Generate the appropriate format
  if (format === 'csv') {
    return {
      content: generateCSV(rows),
      contentType: 'text/csv',
      filename: `${league.name.replace(/\s+/g, '-')}-schedule-report.csv`
    };
  }
  
  // For other formats, we'd need to implement conversion
  throw new Error(`Format '${format}' not implemented yet`);
}

// Function to generate a standings report
async function generateStandingsReport(leagueId, format) {
  const league = await LeagueModel.findById(leagueId);
  if (!league) throw new Error('League not found');
  
  const teams = await TeamModel.find({ _id: { $in: league.teams } });
  
  // Calculate standings data
  const standings = [];
  
  for (const team of teams) {
    // Get match data for this team
    const matches = await MatchModel.find({
      leagueId,
      status: 'completed',
      $or: [
        { homeTeam: team._id },
        { awayTeam: team._id }
      ]
    });
    
    let wins = 0;
    let losses = 0;
    let setsWon = 0;
    let setsLost = 0;
    let pointsFor = 0;
    let pointsAgainst = 0;
    
    matches.forEach(match => {
      const isHome = match.homeTeam.equals(team._id);
      const isWinner = match.winner && match.winner.equals(team._id);
      
      if (isWinner) {
        wins++;
      } else {
        losses++;
      }
      
      // Count sets and points
      if (match.sets && match.sets.length > 0) {
        match.sets.forEach(set => {
          const teamScore = isHome ? set.homeScore : set.awayScore;
          const opponentScore = isHome ? set.awayScore : set.homeScore;
          
          if (teamScore > opponentScore) {
            setsWon++;
          } else {
            setsLost++;
          }
          
          pointsFor += teamScore;
          pointsAgainst += opponentScore;
        });
      }
    });
    
    // Calculate league points (3 for win, 0 for loss)
    const leaguePoints = wins * 3;
    
    standings.push({
      TeamName: team.name,
      Played: wins + losses,
      Wins: wins,
      Losses: losses,
      SetsWon: setsWon,
      SetsLost: setsLost,
      PointsFor: pointsFor,
      PointsAgainst: pointsAgainst,
      PointDifference: pointsFor - pointsAgainst,
      LeaguePoints: leaguePoints
    });
  }
  
  // Sort by league points (descending)
  standings.sort((a, b) => b.LeaguePoints - a.LeaguePoints);
  
  // Generate the appropriate format
  if (format === 'csv') {
    return {
      content: generateCSV(standings),
      contentType: 'text/csv',
      filename: `${league.name.replace(/\s+/g, '-')}-standings-report.csv`
    };
  }
  
  // For other formats, we'd need to implement conversion
  throw new Error(`Format '${format}' not implemented yet`);
}

export async function GET(
  request: Request, 
  { params }: { params: { id: string, type: string } }
) {
  try {
    await connect();
    
    const leagueId = params.id;
    const reportType = params.type;
    const session = await getServerSession(authOptions);
    
    // Check admin access
    if (!session || !hasRole(session, ROLES.ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    
    // Validate format
    if (!['csv', 'xlsx', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported formats: csv, xlsx, pdf' }, { status: 400 });
    }
    
    // Generate the appropriate report
    let report;
    switch (reportType) {
      case 'teams':
        report = await generateTeamsReport(leagueId, format);
        break;
      case 'schedule':
        report = await generateScheduleReport(leagueId, format);
        break;
      case 'standings':
        report = await generateStandingsReport(leagueId, format);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    // Return the report with appropriate headers
    return new NextResponse(report.content, {
      headers: {
        'Content-Type': report.contentType,
        'Content-Disposition': `attachment; filename="${report.filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', message: error.message }, 
      { status: 500 }
    );
  }
}
