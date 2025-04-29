/**
 * Public upcoming matches component
 * Displays scheduled and unscheduled matches
 */

import { formatDate, formatTime, isToday } from '@/utils/date';
import { Calendar, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="text-center py-8">
        <p className="text-gray-400">No upcoming matches scheduled.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedMatches.map(match => (
        <div 
          key={match._id} 
          className={cn(
            "relative overflow-hidden rounded-lg bg-gray-800/50 border border-gray-700/30 shadow-md transition-all",
            "hover:bg-gray-800/70",
            match.scheduledDate && isToday(match.scheduledDate) ? "ring-2 ring-orange-500/30" : ""
          )}
        >
          {/* Top gradient for today's matches */}
          {match.scheduledDate && isToday(match.scheduledDate) && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          )}
          
          {/* Corner decoration - subtle effect */}
          <div className="absolute top-0 right-0 border-t border-r border-orange-500/30 w-8 h-8 transform translate-x-4 -translate-y-4 rotate-45 bg-gradient-to-br from-transparent to-orange-500/5"></div>
          
          {/* Main content */}
          <div className="p-4">
            {/* Date and location section */}
            <div className="flex justify-between items-center mb-3">
              <MatchDateBadge match={match} />
              
              {match.location && (
                <div className="flex items-center text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 text-orange-400" />
                  {match.location}
                </div>
              )}
            </div>
            
            {/* Teams section */}
            <div className="py-3 flex items-center">
              {/* Team A */}
              <div className="w-2/5 text-left">
                <div className="font-medium text-white truncate">
                  {match.teamA?.name || 'Team A'}
                </div>
              </div>
              
              {/* VS Badge */}
              <div className="w-1/5 flex justify-center">
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700/70 text-gray-300">
                  VS
                </div>
              </div>
              
              {/* Team B */}
              <div className="w-2/5 text-right">
                <div className="font-medium text-white truncate">
                  {match.teamB?.name || 'Team B'}
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className={cn(
              "mt-2 pt-2 border-t border-gray-700/30 flex justify-end",
              match.status === 'unscheduled' ? "text-amber-400" : "text-gray-400"
            )}>
              <div className="flex items-center text-xs">
                {match.status === 'unscheduled' ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    <span className="italic">Not yet scheduled</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span className="capitalize">{match.status}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MatchDateBadge({ match }: { match: Match }) {
  // No date scheduled
  if (!match.scheduledDate) {
    return (
      <div className="flex items-center px-3 py-1.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        <span>Date to be determined</span>
      </div>
    );
  }
  
  // Match is today
  if (isToday(match.scheduledDate)) {
    const timeText = match.scheduledTime ? `at ${formatTime(match.scheduledTime)}` : '';
    
    return (
      <div className="flex items-center px-3 py-1.5 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs">
        <Calendar className="h-3.5 w-3.5 mr-1.5" />
        <span className="font-semibold">
          Today {timeText}
        </span>
      </div>
    );
  }
  
  // Future match
  const formattedDate = formatDate(match.scheduledDate);
  const formattedTime = match.scheduledTime ? formatTime(match.scheduledTime) : '';
  
  return (
    <div className="flex items-center px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
      <Calendar className="h-3.5 w-3.5 mr-1.5" />
      <span>
        {formattedDate} {formattedTime ? `at ${formattedTime}` : ''}
      </span>
    </div>
  );
}