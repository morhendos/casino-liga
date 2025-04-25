/**
 * Public league header component
 * Displays league name, description, dates, etc.
 */

import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { SkewedButton } from '@/components/ui/SkewedButton';
import Link from 'next/link';
import { UserPlus, Calendar, Share2, Clock } from 'lucide-react';

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
  }
}

export default function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div className="bg-card">
      {league.banner ? (
        <div className="relative">
          <div className="h-64 overflow-hidden">
            <img 
              src={league.banner} 
              alt={`${league.name} banner`} 
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
          </div>
          
          {/* Content overlay for banner version */}
          <div className="absolute bottom-0 left-0 w-full p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <Badge variant={getStatusVariant(league.status)} size="lg" className="mb-2">
                  {formatStatus(league.status)}
                </Badge>
                <h1 className="text-3xl font-bold text-white drop-shadow-md">
                  {league.name}
                </h1>
              </div>
              
              {/* Date information - consolidated */}
              {(league.startDate || league.endDate) && (
                <div className="flex gap-3 bg-black/30 backdrop-blur-sm rounded px-4 py-2 text-white">
                  <Clock className="h-5 w-5 text-padeliga-orange flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    {league.startDate && (
                      <div className="flex items-center text-sm">
                        <span className="font-semibold mr-1">Inicio:</span> 
                        <span>{formatDate(league.startDate)}</span>
                      </div>
                    )}
                    {league.endDate && (
                      <div className="flex items-center text-sm">
                        <span className="font-semibold mr-1">Fin:</span>
                        <span>{formatDate(league.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Buttons in a neat row */}
            <div className="flex flex-wrap gap-3">
              <SkewedButton
                buttonVariant="teal"
                buttonSize="sm"
                hoverEffectColor="teal"
                hoverEffectVariant="solid"
                className="text-white"
                asChild
              >
                <Link href={`/leagues/${league._id}/schedule`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Ver Calendario</span>
                </Link>
              </SkewedButton>
              
              {league.status === 'registration' && (
                <SkewedButton
                  buttonVariant="orange"
                  buttonSize="sm"
                  hoverEffectColor="orange"
                  hoverEffectVariant="solid"
                  className="text-white"
                  asChild
                >
                  <Link href={`/leagues/${league._id}/register`} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Inscribirme</span>
                  </Link>
                </SkewedButton>
              )}
              
              <SkewedButton
                buttonVariant="purple"
                buttonSize="sm"
                hoverEffectColor="purple"
                hoverEffectVariant="outline"
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-purple-500/20"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Compartir</span>
                </div>
              </SkewedButton>
            </div>
          </div>
        </div>
      ) : (
        /* Non-banner version with better layout */
        <div className="p-5">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-4">
            <div>
              <Badge variant={getStatusVariant(league.status)} size="lg" className="mb-2">
                {formatStatus(league.status)}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {league.name}
              </h1>
            </div>
            
            {/* Date information - consolidated */}
            {(league.startDate || league.endDate) && (
              <div className="flex gap-3 bg-gray-100 dark:bg-gray-800 rounded px-4 py-2">
                <Clock className="h-5 w-5 text-padeliga-orange flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  {league.startDate && (
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-1">Inicio:</span> 
                      <span>{formatDate(league.startDate)}</span>
                    </div>
                  )}
                  {league.endDate && (
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-1">Fin:</span>
                      <span>{formatDate(league.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* League description */}
          {league.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {league.description}
            </p>
          )}
          
          {/* Display venue if available */}
          {league.venue && (
            <div className="mb-4 inline-flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
              <span className="font-semibold mr-1">Sede:</span>
              {league.venue}
            </div>
          )}
          
          {/* Buttons in a neat row */}
          <div className="flex flex-wrap gap-3 mt-4">
            <SkewedButton
              buttonVariant="teal"
              buttonSize="sm"
              hoverEffectColor="teal"
              hoverEffectVariant="solid"
              className="text-white"
              asChild
            >
              <Link href={`/leagues/${league._id}/schedule`} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ver Calendario</span>
              </Link>
            </SkewedButton>
            
            {league.status === 'registration' && (
              <SkewedButton
                buttonVariant="orange"
                buttonSize="sm"
                hoverEffectColor="orange"
                hoverEffectVariant="solid"
                className="text-white"
                asChild
              >
                <Link href={`/leagues/${league._id}/register`} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Inscribirme</span>
                </Link>
              </SkewedButton>
            )}
            
            <SkewedButton
              buttonVariant="purple"
              buttonSize="sm"
              hoverEffectColor="purple"
              hoverEffectVariant="outline"
              className="border border-padeliga-purple text-padeliga-purple hover:bg-padeliga-purple/10"
            >
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </div>
            </SkewedButton>
          </div>
        </div>
      )}
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