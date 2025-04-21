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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';

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
    <div className="relative">
      <GeometricBackground variant="subtle" animated={true} />
      
      <div className="relative z-10">
        <Card variant="gradient" className="overflow-hidden mb-6">
          <div className="p-1">
            <CardContent className="bg-card p-0">
              <LeagueHeader league={league} />
            </CardContent>
          </div>
        </Card>
        
        {/* League Stats Summary */}
        {rankings.length > 0 && (
          <Card variant="elevated" hover="highlight" className="mb-6">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Equipos</div>
                  <div className="text-2xl font-bold text-padeliga-purple">{rankings.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Partidos</div>
                  <div className="text-2xl font-bold text-padeliga-teal">{matches.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Jugados</div>
                  <div className="text-2xl font-bold text-padeliga-green">{completedMatches.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Próximos</div>
                  <div className="text-2xl font-bold text-padeliga-orange">{upcomingMatches.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <Card variant="elevated" className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="heading-accent text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Clasificación Actual
                  </span>
                  <Badge variant="purple-subtle" className="ml-auto">
                    {rankings.length} Equipos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RankingsTable rankings={rankings} />
              </CardContent>
            </Card>
            
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="heading-accent text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Próximos Partidos
                  </span>
                  <Badge variant="orange-subtle" className="ml-auto">
                    {upcomingMatches.length} Partidos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingMatches matches={upcomingMatches} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="heading-accent text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Resultados Recientes
                  </span>
                  <Badge variant="green-subtle" className="ml-auto">
                    {completedMatches.length} Jugados
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatchResults matches={completedMatches} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}