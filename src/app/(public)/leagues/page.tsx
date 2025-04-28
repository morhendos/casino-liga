/**
 * Public leagues list page
 * Displays all public leagues
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getPublicLeagues } from '@/lib/db/leagues';
import { formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkewedButton } from '@/components/ui/SkewedButton';
import GeometricBackground from '@/components/ui/GeometricBackground';
import { Calendar, Trophy, Users, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ligas Públicas - Padeliga',
  description: 'Explora todas las ligas públicas de padel disponibles en Padeliga',
};

export default async function LeaguesPage() {
  const leagues = await getPublicLeagues();
  
  return (
    <div className="relative min-h-screen">
      <GeometricBackground variant="subtle" animated={true} />
      
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Ligas Públicas de Padel
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explora las ligas públicas y descubre la actividad de padel en tu zona
            </p>
          </div>
          
          {leagues.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                No hay ligas públicas disponibles en este momento
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Regresa más tarde o crea tu propia liga
              </p>
              <SkewedButton
                buttonVariant="teal"
                buttonSize="lg"
                hoverEffectColor="teal"
                hoverEffectVariant="solid"
                className="inline-flex gap-2 text-white font-medium" 
                asChild
              >
                <Link href="/signup">
                  <span>Crear una Liga</span>
                  <Trophy className="h-5 w-5" />
                </Link>
              </SkewedButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league) => (
                <Card 
                  key={league._id.toString()} 
                  variant="elevated"
                  hover="highlight"
                  className="overflow-hidden h-full flex flex-col"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={getStatusVariant(league.status)}>
                        {formatStatus(league.status)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold line-clamp-2 heading-accent">
                      {league.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-2 pb-6 flex-grow">
                    {league.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {league.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2 text-padeliga-teal" />
                        <span className="font-medium">Inicio:</span>
                        <span className="ml-2">{formatDate(league.startDate)}</span>
                      </div>
                      
                      {league.teams && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2 text-padeliga-purple" />
                          <span className="font-medium">Equipos:</span>
                          <span className="ml-2">{league.teams} en total</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <div className="px-6 pb-6 mt-auto">
                    <SkewedButton
                      buttonVariant="orange"
                      buttonSize="default"
                      hoverEffectColor="orange"
                      hoverEffectVariant="solid"
                      className="w-full text-white font-medium"
                      asChild
                    >
                      <Link href={`/leagues/${league._id}`} className="flex items-center justify-center gap-2">
                        <span>Ver Detalles</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </SkewedButton>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get the right variant for status
function getStatusVariant(status: string): string {
  const variantMap: Record<string, string> = {
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