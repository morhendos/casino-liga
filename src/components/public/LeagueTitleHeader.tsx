'use client';

import React, { useEffect } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';

interface LeagueTitleHeaderProps {
  league: {
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function LeagueTitleHeader({ league }: LeagueTitleHeaderProps) {
  // Client-side only rendering for the portal
  const [mounted, setMounted] = React.useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Define status colors
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-purple-600',
      'registration': 'bg-teal-600',
      'active': 'bg-padeliga-orange',
      'completed': 'bg-green-600',
      'canceled': 'bg-red-600',
    };
    return colorMap[status] || 'bg-gray-600';
  };

  // Format status text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Borrador',
      'registration': 'Inscripciones',
      'active': 'Activo',
      'completed': 'Completado',
      'canceled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // The content to be rendered in the portal - with proper theme support
  const titleContent = (
    <div className="flex items-center ml-1.5">
      <ChevronRight className="h-4 w-4 text-gray-400" />
      <div className="flex items-center">
        <h1 className="font-bold text-gray-900 dark:text-white text-lg ml-1 mr-2">
          {league.name}
        </h1>
        <div className={`text-xs px-2 py-0.5 rounded-sm text-white ${getStatusColor(league.status)}`}>
          {getStatusText(league.status)}
        </div>
        
        {(league.startDate || league.endDate) && (
          <div className="hidden md:flex items-center ml-3 text-xs text-gray-600 dark:text-gray-300">
            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
            {league.startDate && (
              <span>{formatDate(league.startDate)}</span>
            )}
            {league.startDate && league.endDate && (
              <span className="mx-1">-</span>
            )}
            {league.endDate && (
              <span>{formatDate(league.endDate)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Use createPortal to render the title in the correct location in the DOM
  if (mounted) {
    const titleContainer = document.getElementById('dynamic-title');
    if (titleContainer) {
      return createPortal(titleContent, titleContainer);
    }
  }

  // Fallback if the portal target isn't available
  return null;
}