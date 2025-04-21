/**
 * Public upcoming matches component
 * Displays scheduled and unscheduled matches
 */

import { formatDate, formatTime, isToday } from '@/utils/date';

interface Team {
  _id: string;
  name: string;
}

interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  status: string;
}

interface UpcomingMatchesProps {
  matches: Match[];
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  // Sort matches by date
  const sortedMatches = [...matches].sort((a, b) => {
    // Scheduled matches first, then by date
    if (a.scheduledDate && !b.scheduledDate) return -1;
    if (!a.scheduledDate && b.scheduledDate) return 1;
    
    // Both have dates or both are unscheduled
    if (a.scheduledDate && b.scheduledDate) {
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    
    // Both are unscheduled, keep original order
    return 0;
  });
  
  if (!sortedMatches || sortedMatches.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No upcoming matches scheduled.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedMatches.map(match => (
        <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm">
              {renderDateStatus(match)}
            </div>
            {match.location && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {match.location}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="w-2/5 text-left font-medium text-gray-700 dark:text-gray-300">
              {match.teamA?.name || 'Team A'}
            </div>
            
            <div className="w-1/5 text-center text-gray-500 dark:text-gray-400">
              vs
            </div>
            
            <div className="w-2/5 text-right font-medium text-gray-700 dark:text-gray-300">
              {match.teamB?.name || 'Team B'}
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {match.status === 'unscheduled' ? (
              <span className="italic">Not yet scheduled</span>
            ) : (
              <span className="capitalize">{match.status}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to render date status with appropriate formatting
function renderDateStatus(match: Match) {
  if (!match.scheduledDate) {
    return (
      <span className="text-yellow-500 dark:text-yellow-300">
        Date to be determined
      </span>
    );
  }
  
  const formattedDate = formatDate(match.scheduledDate);
  const formattedTime = match.scheduledTime ? formatTime(match.scheduledTime) : '';
  
  // Check if match is today
  if (isToday(match.scheduledDate)) {
    return (
      <span className="font-semibold text-green-600 dark:text-green-400">
        Today {formattedTime ? `at ${formattedTime}` : ''}
      </span>
    );
  }
  
  return (
    <span className="text-gray-600 dark:text-gray-300">
      {formattedDate} {formattedTime ? `at ${formattedTime}` : ''}
    </span>
  );
}
