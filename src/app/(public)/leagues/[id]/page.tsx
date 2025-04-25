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
  
  return (
    <div className="relative min-h-screen flex flex-col">
      <GeometricBackground variant="subtle" animated={true} />
      
      <div className="relative z-10 flex-grow">
        {/* Removed the back button since we already have "Ligas" in the header */}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Card variant="gradient" className="overflow-hidden mb-6">
            <div className="p-1">
              <CardContent className="bg-card p-0">
                <LeagueHeader league={{...league, _id: params.id}} />
              </CardContent>
            </div>
          </Card>
          
          {/* League Stats Summary - Improved spacing and layout */}
          {rankings.length > 0 && (
            <Card variant="elevated" hover="highlight" className="mb-6">
              <CardContent className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-padeliga-purple/10 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-6 w-6 text-padeliga-purple" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Equipos</div>
                    <div className="text-2xl font-bold text-padeliga-purple">{rankings.length}</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-padeliga-teal/10 rounded-full flex items-center justify-center mb-2">
                      <BarChart3 className="h-6 w-6 text-padeliga-teal" />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Partidos</div>
                    <div className="text-2xl font-bold text-padeliga-teal">{matches.length}</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-padeliga-green/10 rounded-full flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-padeliga-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jugados</div>
                    <div className="text-2xl font-bold text-padeliga-green">{completedMatches.length}</div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-padeliga-orange/10 rounded-full flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-padeliga-orange" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Próximos</div>
                    <div className="text-2xl font-bold text-padeliga-orange">{upcomingMatches.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Improved grid layout for better space usage */}
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