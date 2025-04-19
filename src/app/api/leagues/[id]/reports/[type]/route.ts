import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
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

export async function GET(
  request: Request, 
  { params }: { params: { id: string, type: string } }
) {
  try {
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
    
    // Generate mock reports
    let rows = [];
    let filename = '';
    
    switch (reportType) {
      case 'teams':
        rows = [
          { TeamName: "Team Alpha", Players: "John Doe, Jane Smith", TotalMatches: 10, CompletedMatches: 8, Wins: 6, WinPercentage: 75, ParticipationRate: 80 },
          { TeamName: "Team Beta", Players: "Bob Johnson, Alice Brown", TotalMatches: 10, CompletedMatches: 9, Wins: 5, WinPercentage: 56, ParticipationRate: 90 },
          { TeamName: "Team Gamma", Players: "Mike Wilson, Sarah Davis", TotalMatches: 10, CompletedMatches: 7, Wins: 4, WinPercentage: 57, ParticipationRate: 70 },
          { TeamName: "Team Delta", Players: "Chris Martin, Emily Clark", TotalMatches: 10, CompletedMatches: 10, Wins: 3, WinPercentage: 30, ParticipationRate: 100 },
          { TeamName: "Team Epsilon", Players: "David Miller, Laura Wilson", TotalMatches: 10, CompletedMatches: 6, Wins: 2, WinPercentage: 33, ParticipationRate: 60 }
        ];
        filename = `League-teams-report.csv`;
        break;
      case 'schedule':
        rows = [
          { Date: "2025-05-01", Time: "18:00", Location: "Main Court", HomeTeam: "Team Alpha", AwayTeam: "Team Beta", Status: "Completed", Result: "6-4, 6-3" },
          { Date: "2025-05-03", Time: "14:30", Location: "Court 2", HomeTeam: "Team Gamma", AwayTeam: "Team Delta", Status: "Completed", Result: "7-5, 4-6, 10-8" },
          { Date: "2025-05-08", Time: "19:15", Location: "Main Court", HomeTeam: "Team Epsilon", AwayTeam: "Team Alpha", Status: "Scheduled", Result: "" },
          { Date: "2025-05-10", Time: "16:00", Location: "Court 3", HomeTeam: "Team Beta", AwayTeam: "Team Gamma", Status: "Scheduled", Result: "" },
          { Date: "2025-05-15", Time: "20:00", Location: "Main Court", HomeTeam: "Team Delta", AwayTeam: "Team Epsilon", Status: "Scheduled", Result: "" }
        ];
        filename = `League-schedule-report.csv`;
        break;
      case 'standings':
        rows = [
          { TeamName: "Team Alpha", Played: 8, Wins: 6, Losses: 2, SetsWon: 14, SetsLost: 4, PointsFor: 112, PointsAgainst: 84, PointDifference: 28, LeaguePoints: 18 },
          { TeamName: "Team Beta", Played: 9, Wins: 5, Losses: 4, SetsWon: 12, SetsLost: 10, PointsFor: 120, PointsAgainst: 108, PointDifference: 12, LeaguePoints: 15 },
          { TeamName: "Team Gamma", Played: 7, Wins: 4, Losses: 3, SetsWon: 10, SetsLost: 8, PointsFor: 94, PointsAgainst: 88, PointDifference: 6, LeaguePoints: 12 },
          { TeamName: "Team Delta", Played: 10, Wins: 3, Losses: 7, SetsWon: 8, SetsLost: 16, PointsFor: 102, PointsAgainst: 124, PointDifference: -22, LeaguePoints: 9 },
          { TeamName: "Team Epsilon", Played: 6, Wins: 2, Losses: 4, SetsWon: 5, SetsLost: 9, PointsFor: 72, PointsAgainst: 90, PointDifference: -18, LeaguePoints: 6 }
        ];
        filename = `League-standings-report.csv`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
    
    // Generate the report content
    const content = generateCSV(rows);
    
    // Return the report with appropriate headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
