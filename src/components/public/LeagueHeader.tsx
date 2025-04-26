/**
 * Public league header component
 * Displays league name, description, dates, etc.
 */

import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Clock, Trophy, BarChart3, Calendar, CheckCircle } from 'lucide-react';

interface LeagueHeaderProps {
  league: {
    _id?: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
    status: string;
    banner?: string;
  };
  stats?: {
    teamsCount: number;
    matchesCount: number;
    completedCount: number;
    upcomingCount: number;
  };
}

export default function LeagueHeader({ league, stats }: LeagueHeaderProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
          <div>
            <div className="mb-2">
              <Badge 
                variant={getStatusVariant(league.status)} 
                size="lg"
                className="font-medium text-white"
              >
                {formatStatus(league.status)}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {league.name}
            </h1>
            
            {/* Date information in a nice format */}
            {(league.startDate || league.endDate) && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mt-2">
                <Clock className="h-4 w-4 text-padeliga-orange" />
                {league.startDate && (
                  <span>
                    <span className="font-medium">Inicio:</span> {formatDate(league.startDate)}
                  </span>
                )}
                {league.startDate && league.endDate && (
                  <span className="mx-1">•</span>
                )}
                {league.endDate && (
                  <span>
                    <span className="font-medium">Fin:</span> {formatDate(league.endDate)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats summary integrated into header */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 md:gap-6 pb-3 pt-2 border-t border-gray-300 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="mb-1 p-2">
                <Trophy className="h-5 w-5 text-padeliga-purple" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Equipos</div>
              <div className="text-xl font-bold text-padeliga-purple">{stats.teamsCount}</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-1 p-2">
                <BarChart3 className="h-5 w-5 text-padeliga-teal" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Partidos</div>
              <div className="text-xl font-bold text-padeliga-teal">{stats.matchesCount}</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-1 p-2">
                <CheckCircle className="h-5 w-5 text-padeliga-green" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Jugados</div>
              <div className="text-xl font-bold text-padeliga-green">{stats.completedCount}</div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="mb-1 p-2">
                <Calendar className="h-5 w-5 text-padeliga-orange" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Próximos</div>
              <div className="text-xl font-bold text-padeliga-orange">{stats.upcomingCount}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get the right variant for status
function getStatusVariant(status: string): any {
  const variantMap: Record<string, any> = {
    'draft': 'purple-subtle',
    'registration': 'teal',
    'active': 'orange',
    'completed': 'green',
    'canceled': 'red-subtle',
  };
  
  return variantMap[status] || 'default';
}

// Helper function to format status text
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Borrador',
    'registration': 'Abierto a Inscripciones',
    'active': 'Activo',
    'completed': 'Completado',
    'canceled': 'Cancelado'
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}