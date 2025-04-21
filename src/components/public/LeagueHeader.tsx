/**
 * Public league header component
 * Displays league name, description, dates, etc.
 */

import { formatDate } from '@/utils/date';

interface LeagueHeaderProps {
  league: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
    status: string;
    banner?: string;
  }
}

export default function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{league.name}</h1>
      
      {league.banner && (
        <div className="mt-4 h-48 overflow-hidden rounded-lg">
          <img 
            src={league.banner} 
            alt={`${league.name} banner`} 
            className="w-full object-cover"
          />
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-gray-600 dark:text-gray-300">{league.description}</p>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {league.startDate && (
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold">Start:</span> {formatDate(league.startDate)}
            </div>
          )}
          
          {league.endDate && (
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold">End:</span> {formatDate(league.endDate)}
            </div>
          )}
          
          {league.venue && (
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold">Venue:</span> {league.venue}
            </div>
          )}
          
          <div className={`px-3 py-1 rounded-full ${getStatusColor(league.status)}`}>
            <span className="font-semibold">Status:</span>{' '}
            <span className="capitalize">{league.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get the right color for status
function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 dark:bg-gray-700';
    case 'registration':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
    case 'active':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
    case 'completed':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
    case 'canceled':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 dark:bg-gray-700';
  }
}
