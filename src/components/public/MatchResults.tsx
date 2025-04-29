/**
 * Public match results component
 * Displays completed matches and their scores
 */

import { formatDate } from '@/utils/date';
import { MapPin, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="text-center py-8">
        <p className="text-gray-400">No match results available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedMatches.map(match => (
        <div key={match._id} className="relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700/30 shadow-md p-4 transition-all hover:bg-gray-800/70">
          {/* Corner decoration - subtle effect */}
          <div className="absolute top-0 right-0 border-t border-r border-green-500/30 w-8 h-8 transform translate-x-4 -translate-y-4 rotate-45 bg-gradient-to-br from-transparent to-green-500/5"></div>
          
          {/* Date and location information */}
          <div className="flex flex-wrap gap-2 items-center mb-3 text-xs text-gray-400">
            {match.scheduledDate && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                {formatDate(match.scheduledDate)}
              </div>
            )}
            
            {match.location && (
              <div className="flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                {match.location}
              </div>
            )}
          </div>
          
          {/* Match teams and score */}
          <div className="flex justify-between items-center my-3">
            {/* Team A */}
            <div className={cn(
              "w-2/5 text-left font-medium px-2 py-1 rounded-l-md",
              isTeamWinner(match, match.teamA._id) 
                ? "bg-green-900/20 text-green-300 border-l-2 border-green-500" 
                : "text-gray-300"
            )}>
              {match.teamA?.name || 'Team A'}
              {isTeamWinner(match, match.teamA._id) && (
                <span className="ml-2 inline-flex">
                  <Trophy size={14} className="text-green-400" />
                </span>
              )}
            </div>
            
            {/* Score */}
            <div className="w-1/5 text-center font-bold">
              {match.result ? (
                <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-700/50 text-white">
                  {formatScores(match.result.teamAScore, match.result.teamBScore)}
                </div>
              ) : (
                <div className="text-gray-500">vs</div>
              )}
            </div>
            
            {/* Team B */}
            <div className={cn(
              "w-2/5 text-right font-medium px-2 py-1 rounded-r-md",
              isTeamWinner(match, match.teamB._id) 
                ? "bg-green-900/20 text-green-300 border-r-2 border-green-500" 
                : "text-gray-300"
            )}>
              {isTeamWinner(match, match.teamB._id) && (
                <span className="mr-2 inline-flex">
                  <Trophy size={14} className="text-green-400" />
                </span>
              )}
              {match.teamB?.name || 'Team B'}
            </div>
          </div>
          
          {/* Set scores detail - if more than one set */}
          {match.result && match.result.teamAScore.length > 1 && (
            <div className="mt-2 pt-2 border-t border-gray-700/30">
              <div className="grid grid-cols-3 gap-2">
                {match.result.teamAScore.map((score, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-1 rounded bg-gray-700/30 text-xs">
                    <span className={isSetWinner(score, match.result!.teamBScore[idx]) ? "text-green-400" : "text-gray-400"}>
                      {score}
                    </span>
                    <span className="text-gray-500">Set {idx + 1}</span>
                    <span className={isSetWinner(match.result!.teamBScore[idx], score) ? "text-green-400" : "text-gray-400"}>
                      {match.result.teamBScore[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  
  // For multiple sets, count sets won by each team
  const teamASets = teamAScores.filter((score, idx) => score > teamBScores[idx]).length;
  const teamBSets = teamBScores.filter((score, idx) => score > teamAScores[idx]).length;
  
  return `${teamASets}-${teamBSets}`;
}

// Helper function to check if team is the winner
function isTeamWinner(match: Match, teamId: string): boolean {
  return match.result?.winner === teamId;
}

// Helper function to check if a player won a set
function isSetWinner(score1: number, score2: number): boolean {
  return score1 > score2;
}