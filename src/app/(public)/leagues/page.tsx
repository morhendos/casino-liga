/**
 * Public leagues directory page
 * Lists all available public leagues
 */

import Link from 'next/link';
import { Metadata } from 'next';
import { getPublicLeagues } from '@/lib/db/leagues';
import { formatDate } from '@/utils/date';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GeometricBackground from '@/components/ui/GeometricBackground';

export const metadata: Metadata = {
  title: 'Browse Leagues - Padeliga',
  description: 'Browse and discover padel leagues on Padeliga',
};

export default async function LeaguesDirectoryPage() {
  // Fetch public leagues
  const leagues = await getPublicLeagues();
  
  return (
    <div className="relative">
      <GeometricBackground variant="subtle" animated={true} />
      
      <div className="relative z-10">
        <h1 className="heading-accent text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Ligas Disponibles
        </h1>
        
        {leagues.length === 0 ? (
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                No hay ligas disponibles en este momento.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Regresa más tarde para ver las próximas ligas.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map(league => (
              <Link 
                key={league._id} 
                href={`/leagues/${league._id}`}
                className="block"
              >
                <Card 
                  variant="gradient" 
                  hover="raise" 
                  className="h-full overflow-hidden"
                >
                  <div className="p-1 h-full">
                    <CardContent className="h-full bg-card flex flex-col">
                      {league.banner && (
                        <div className="h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                          <img 
                            src={league.banner} 
                            alt={league.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {league.name}
                      </h2>
                      
                      {league.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                          {league.description}
                        </p>
                      )}
                      
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Badge 
                            variant={getStatusVariant(league.status)} 
                            size="lg"
                          >
                            {formatStatus(league.status)}
                          </Badge>
                          
                          {league.startDate && (
                            <Badge variant="outline" size="lg">
                              Comienza: {formatDate(league.startDate)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
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