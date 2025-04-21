/**
 * Public league header component
 * Displays league name, description, dates, etc.
 */

import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';

interface LeagueHeaderProps {
  league: {
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
          <div className="h-48 overflow-hidden">
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
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              {league.name}
            </h1>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-4">
            <Badge variant={getStatusVariant(league.status)} size="lg">
              {formatStatus(league.status)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white heading-accent mb-2">
            {league.name}
          </h1>
        </div>
      )}
      
      <div className="p-6 pt-0">
        {league.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {league.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-sm">
          {league.startDate && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold mr-1">Inicio:</span> 
              {formatDate(league.startDate)}
            </div>
          )}
          
          {league.endDate && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold mr-1">Fin:</span>
              {formatDate(league.endDate)}
            </div>
          )}
          
          {league.venue && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="font-semibold mr-1">Sede:</span>
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