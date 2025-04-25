/**
 * Public league page
 * Displays league information, rankings, and matches
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicLeagueById } from '@/lib/db/leagues';
import { getPublicLeagueRankings } from '@/lib/db/rankings';
import { getPublicLeagueMatches, getCompletedLeagueMatches, getUpcomingLeagueMatches } from '@/lib/db/matches';
import { LeagueTitleHeader, RankingsTable, MatchResults, UpcomingMatches } from '@/components/public';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';
import { Trophy, BarChart3, CheckCircle, Calendar } from 'lucide-react';

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
    <div className="relative min-h-screen flex flex-col">
      <GeometricBackground variant="subtle" animated={true} />
      <LeagueTitleHeader league={league} />
      
      <div className="relative z-10 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Stats cards in a grid at the top */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#13151c] text-white shadow-lg">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Trophy className="h-6 w-6 text-padeliga-purple mb-1" />
                <h3 className="text-sm text-gray-400">Equipos</h3>
                <p className="text-2xl font-bold text-padeliga-purple">{rankings.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#13151c] text-white shadow-lg">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-6 w-6 text-padeliga-teal mb-1" />
                <h3 className="text-sm text-gray-400">Partidos</h3>
                <p className="text-2xl font-bold text-padeliga-teal">{matches.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#13151c] text-white shadow-lg">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-6 w-6 text-padeliga-green mb-1" />
                <h3 className="text-sm text-gray-400">Jugados</h3>
                <p className="text-2xl font-bold text-padeliga-green">{completedMatches.length}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#13151c] text-white shadow-lg">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Calendar className="h-6 w-6 text-padeliga-orange mb-1" />
                <h3 className="text-sm text-gray-400">Próximos</h3>
                <p className="text-2xl font-bold text-padeliga-orange">{upcomingMatches.length}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* League description if available */}
          {league.description && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <p className="text-gray-600 dark:text-gray-300">{league.description}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Grid layout for rankings and matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card variant="elevated" className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="heading-accent text-xl font-bold text-gray-900 dark:text-white">
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
                    <span className="heading-accent text-xl font-bold text-gray-900 dark:text-white">
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
                    <span className="heading-accent text-xl font-bold text-gray-900 dark:text-white">
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