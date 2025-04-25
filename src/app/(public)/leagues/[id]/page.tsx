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
import { SkewedButton } from '@/components/ui/SkewedButton';
import Link from 'next/link';
import { ArrowLeft, Trophy, BarChart3 } from 'lucide-react';

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

  // Prepare stats for the header
  const stats = {
    teamsCount: rankings.length,
    matchesCount: matches.length,
    completedCount: completedMatches.length,
    upcomingCount: upcomingMatches.length
  };
  
  return (
    <div className="relative min-h-screen flex flex-col">
      <GeometricBackground variant="subtle" animated={true} />
      
      <div className="relative z-10 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card variant="gradient" className="overflow-hidden mb-6">
            <div className="p-1">
              <CardContent className="p-0">
                <LeagueHeader 
                  league={{...league, _id: params.id}} 
                  stats={stats}
                />
              </CardContent>
            </div>
          </Card>
          
          {/* Grid layout for rankings and matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-16">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card variant="elevated" className="shadow-lg">
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
              
              <Card variant="elevated" className="shadow-lg">
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
              <Card variant="elevated" className="shadow-lg h-full">
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
    </div>
  );
}