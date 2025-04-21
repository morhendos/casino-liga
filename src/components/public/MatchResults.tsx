/**
 * Public match results component
 * Displays completed matches and their scores
 */

import { formatDate } from '@/utils/date';

interface Team {
  _id: string;
  name: string;
}

interface MatchResult {
  teamAScore: number[];
  teamBScore: number[];
  winner?: string;
}

interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  scheduledDate?: string;
  location?: string;
  status: string;
  result?: MatchResult;
}

interface MatchResultsProps {
  matches: Match[];
}

export default function MatchResults({ matches }: MatchResultsProps) {
  // Sort matches by date, most recent first
  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
    const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
  
  if (!sortedMatches || sortedMatches.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No match results available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedMatches.map(match => (
        <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {match.scheduledDate ? formatDate(match.scheduledDate) : 'Date not set'}
            </div>
            {match.location && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {match.location}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className={`w-2/5 text-left font-medium ${getTeamStyle(match, match.teamA._id)}`}>
              {match.teamA?.name || 'Team A'}
            </div>
            
            <div className="w-1/5 text-center font-bold">
              {match.result ? (
                <div className="text-gray-900 dark:text-white">
                  {formatScores(match.result.teamAScore, match.result.teamBScore)}
                </div>
              ) : (
                <div className="text-gray-400 dark:text-gray-500">vs</div>
              )}
            </div>
            
            <div className={`w-2/5 text-right font-medium ${getTeamStyle(match, match.teamB._id)}`}>
              {match.teamB?.name || 'Team B'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to format scores in a readable way
function formatScores(teamAScores: number[], teamBScores: number[]): string {
  if (!teamAScores || !teamBScores || teamAScores.length !== teamBScores.length) {
    return 'Invalid score';
  }
  
  // For single set matches, just show the score
  if (teamAScores.length === 1) {
    return `${teamAScores[0]} - ${teamBScores[0]}`;
  }
  
  // For multiple sets, show each set
  const formattedSets = teamAScores.map((aScore, index) => 
    `${aScore}-${teamBScores[index]}`
  );
  
  return formattedSets.join(' | ');
}

// Helper function to style winning team
function getTeamStyle(match: Match, teamId: string): string {
  if (!match.result || !match.result.winner) {
    return 'text-gray-700 dark:text-gray-300';
  }
  
  return match.result.winner === teamId
    ? 'text-green-600 dark:text-green-400'
    : 'text-gray-700 dark:text-gray-300';
}
