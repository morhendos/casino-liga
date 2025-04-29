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
import { Trophy, BarChart3, CheckCircle, Calendar, Users, MapPin, Info } from 'lucide-react';

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
    <div className="relative min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 -z-10"></div>
      
      {/* Geometric background elements */}
      <div className="fixed inset-0 -z-10 opacity-5 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-padeliga-purple rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-12 w-72 h-72 bg-padeliga-teal rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-padeliga-orange rounded-full blur-3xl"></div>
      </div>
      
      {/* League Title Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-padeliga-purple/20 to-padeliga-teal/20 dark:from-padeliga-purple/10 dark:to-padeliga-teal/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="mb-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-padeliga-purple to-padeliga-purple/80 text-white shadow-sm">
              {getStatusText(league.status)}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {league.name}
          </h1>
          
          {league.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-3xl">
              {league.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-4">
            {(league.startDate || league.endDate) && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <Calendar className="h-4 w-4 mr-2 text-padeliga-orange" />
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateRange(league.startDate, league.endDate)}
                </span>
              </div>
            )}
            
            {league.venue && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-md text-sm bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <MapPin className="h-4 w-4 mr-2 text-padeliga-green" />
                <span className="text-gray-700 dark:text-gray-300">
                  {league.venue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <LeagueTitleHeader league={league} />
      
      <div className="relative z-10 flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats cards grid - Enhanced */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Teams stats card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-lg p-4">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-purple-500"></div>
              
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/10 mb-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-gray-400 text-sm">Equipos</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {rankings.length}
                </p>
              </div>
            </div>
            
            {/* Matches stats card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-lg p-4">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-teal to-cyan-500"></div>
              
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/10 mb-2">
                  <BarChart3 className="h-5 w-5 text-teal-400" />
                </div>
                <p className="text-gray-400 text-sm">Partidos</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {matches.length}
                </p>
              </div>
            </div>
            
            {/* Completed matches stats card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-lg p-4">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-green to-emerald-500"></div>
              
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-gray-400 text-sm">Jugados</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {completedMatches.length}
                </p>
              </div>
            </div>
            
            {/* Upcoming matches stats card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-lg p-4">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-orange to-amber-500"></div>
              
              <div className="relative flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500/10 mb-2">
                  <Calendar className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-gray-400 text-sm">Próximos</p>
                <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  {upcomingMatches.length}
                </p>
              </div>
            </div>
          </div>
          
          {/* Grid layout for rankings and matches */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {/* Left column - Rankings and Upcoming Matches */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Rankings Card */}
              <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
                {/* Gradient accent line at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-purple-500"></div>
                
                {/* Decorative background elements */}
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
                <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
                
                <div className="p-5 border-b border-gray-800/60">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-purple-400" />
                      Clasificación Actual
                    </h2>
                    <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      {rankings.length} Equipos
                    </div>
                  </div>
                </div>
                
                <div className="p-4 overflow-hidden">
                  <RankingsTable rankings={rankings} />
                </div>
              </div>
              
              {/* Upcoming Matches Card */}
              <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
                {/* Gradient accent line at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-orange to-amber-500"></div>
                
                {/* Decorative background elements */}
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-orange-500/5 blur-xl"></div>
                <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-orange-500/5 blur-xl"></div>
                
                <div className="p-5 border-b border-gray-800/60">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-orange-400" />
                      Próximos Partidos
                    </h2>
                    <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                      {upcomingMatches.length} Partidos
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <UpcomingMatches matches={upcomingMatches} />
                </div>
              </div>
            </div>
            
            {/* Right column - Match Results */}
            <div className="lg:col-span-1">
              <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl h-full">
                {/* Gradient accent line at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-green to-emerald-500"></div>
                
                {/* Decorative background elements */}
                <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-green-500/5 blur-xl"></div>
                <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-green-500/5 blur-xl"></div>
                
                <div className="p-5 border-b border-gray-800/60">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                      Resultados Recientes
                    </h2>
                    <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                      {completedMatches.length} Jugados
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <MatchResults matches={completedMatches} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format a date range
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return 'Dates TBD';
  
  if (startDate && endDate) {
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  }
  
  if (startDate) {
    return `From ${new Date(startDate).toLocaleDateString()}`;
  }
  
  return `Until ${new Date(endDate!).toLocaleDateString()}`;
}

// Helper function to get status text
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Borrador',
    'registration': 'Inscripciones',
    'active': 'Activo',
    'completed': 'Completado',
    'canceled': 'Cancelado'
  };
  
  return statusMap[status] || status;
}