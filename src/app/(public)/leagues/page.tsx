/**
 * Public leagues directory page
 * Lists all available public leagues
 */

import Link from 'next/link';
import { Metadata } from 'next';
import { getPublicLeagues } from '@/lib/db/leagues';
import { formatDate } from '@/utils/date';

export const metadata: Metadata = {
  title: 'Browse Leagues - Padeliga',
  description: 'Browse and discover padel leagues on Padeliga',
};

export default async function LeaguesDirectoryPage() {
  // Fetch public leagues
  const leagues = await getPublicLeagues();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Browse Leagues</h1>
      
      {leagues.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">No leagues found.</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Check back later for upcoming leagues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map(league => (
            <Link 
              key={league._id} 
              href={`/leagues/${league._id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              {league.banner && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={league.banner} 
                    alt={league.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{league.name}</h2>
                
                {league.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {league.description}
                  </p>
                )}
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(league.status)}`}>
                    {formatStatus(league.status)}
                  </span>
                  
                  {league.startDate && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      Starts: {formatDate(league.startDate)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    case 'registration':
      return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
    case 'active':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
    case 'completed':
      return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
    case 'canceled':
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  }
}
