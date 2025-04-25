/**
 * Public league header component
 * Displays league name, description, dates, etc.
 */

import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { SkewedButton } from '@/components/ui/SkewedButton';
import Link from 'next/link';
import { UserPlus, Calendar, Share2 } from 'lucide-react';

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
          <div className="absolute bottom-0 left-0 w-full p-6">
            <div className="mb-2">
              <Badge variant={getStatusVariant(league.status)} size="lg">
                {formatStatus(league.status)}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md mb-3">
              {league.name}
            </h1>
            
            {/* Action buttons - Improved styling and spacing */}
            <div className="flex flex-wrap gap-3 mt-4">
              {league.status === 'registration' && (
                <SkewedButton
                  buttonVariant="orange"
                  buttonSize="sm"
                  hoverEffectColor="orange"
                  hoverEffectVariant="solid"
                  className="text-white font-medium"
                  asChild
                >
                  <Link href={`/leagues/${league._id}/register`} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Inscribirme</span>
                  </Link>
                </SkewedButton>
              )}
              
              <SkewedButton
                buttonVariant="teal"
                buttonSize="sm"
                hoverEffectColor="teal"
                hoverEffectVariant="outline"
                className="text-white font-medium"
                asChild
              >
                <Link href={`/leagues/${league._id}/schedule`} className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Ver Calendario</span>
                </Link>
              </SkewedButton>
              
              <SkewedButton
                buttonVariant="ghost"
                buttonSize="sm"
                hoverEffectColor="purple"
                hoverEffectVariant="outline"
                className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 font-medium"
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
        <div className="p-6">
          <div className="mb-4">
            <Badge variant={getStatusVariant(league.status)} size="lg">
              {formatStatus(league.status)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white heading-accent mb-4">
            {league.name}
          </h1>
          
          {/* Action buttons - Improved styling and consistent with banner version */}
          <div className="flex flex-wrap gap-3 my-4">
            {league.status === 'registration' && (
              <SkewedButton
                buttonVariant="orange"
                buttonSize="sm"
                hoverEffectColor="orange"
                hoverEffectVariant="solid"
                className="text-white font-medium"
                asChild
              >
                <Link href={`/leagues/${league._id}/register`} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Inscribirme</span>
                </Link>
              </SkewedButton>
            )}
            
            <SkewedButton
              buttonVariant="teal"
              buttonSize="sm"
              hoverEffectColor="teal"
              hoverEffectVariant="outline"
              className="text-white font-medium"
              asChild
            >
              <Link href={`/leagues/${league._id}/schedule`} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ver Calendario</span>
              </Link>
            </SkewedButton>
            
            <SkewedButton
              buttonVariant="ghost"
              buttonSize="sm"
              hoverEffectColor="purple"
              hoverEffectVariant="outline"
              className="border border-padeliga-purple text-padeliga-purple hover:bg-padeliga-purple/10 font-medium"
            >
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </div>
            </SkewedButton>
          </div>
        </div>
      )}
      
      {/* League information - Better spacing */}
      <div className="p-6 pt-0">
        {league.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-5">
            {league.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm">
          {league.startDate && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded">
              <span className="font-semibold mr-2">Inicio:</span> 
              {formatDate(league.startDate)}
            </div>
          )}
          
          {league.endDate && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded">
              <span className="font-semibold mr-2">Fin:</span>
              {formatDate(league.endDate)}
            </div>
          )}
          
          {league.venue && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-1.5 rounded">
              <span className="font-semibold mr-2">Sede:</span>
              {league.venue}
            </div>
          )}
        </div>
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