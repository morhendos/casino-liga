/**
 * Public league page
 * Displays league information, rankings, and matches
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicLeagueById } from '@/lib/db/leagues';
import { getPublicLeagueRankings } from '@/lib/db/rankings';
import { getPublicLeagueMatches, getCompletedLeagueMatches, getUpcomingLeagueMatches } from '@/lib/db/matches';
import { LeagueHeader, RankingsTable, MatchResults, UpcomingMatches } from '@/components/public';

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const league = await getPublicLeagueById(params.id);
  
  if (!league) {
    return {
      title: 'League Not Found - Padeliga',
    };
  }
  
  return {
    title: `${league.name} - Padeliga`,
    description: league.description || `View rankings and matches for ${league.name} padel league`,
  };
}

export default async function PublicLeaguePage({ params }: { params: { id: string } }) {
  // Fetch league data
  const league = await getPublicLeagueById(params.id);
  
  // If league doesn't exist or isn't public, show 404
  if (!league) {
    notFound();
  }
  
  // Fetch rankings and matches in parallel
  const [rankings, matches] = await Promise.all([
    getPublicLeagueRankings(params.id),
    getPublicLeagueMatches(params.id),
  ]);
  
  // Split matches into completed and upcoming
  const completedMatches = matches.filter(match => match.status === 'completed');
  const upcomingMatches = matches.filter(match => 
    ['scheduled', 'unscheduled'].includes(match.status)
  );
  
  return (
    <>
      <LeagueHeader league={league} />
      
      {/* League Stats Summary (optional) */}
      {rankings.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Teams</div>
              <div className="text-2xl font-bold text-primary">{rankings.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Matches</div>
              <div className="text-2xl font-bold text-primary">{matches.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Played</div>
              <div className="text-2xl font-bold text-primary">{completedMatches.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Upcoming</div>
              <div className="text-2xl font-bold text-primary">{upcomingMatches.length}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Current Rankings</h2>
          <RankingsTable rankings={rankings} />
          
          <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Upcoming Matches</h2>
          <UpcomingMatches matches={upcomingMatches} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recent Results</h2>
          <MatchResults matches={completedMatches} />
        </div>
      </div>
    </>
  );
}
