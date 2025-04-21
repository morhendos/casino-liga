import React from 'react';
import { cn } from '@/lib/utils';

interface PadeligaLogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export function PadeligaLogo({
  className,
  variant = 'default',
  size = 'md',
  showTagline = true,
}: PadeligaLogoProps) {
  // Map sizes to specific heights - adjusted to be more compact
  const sizeClassMap = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };

  const containerClass = cn(
    'inline-block',
    className
  );

  // Choose the appropriate image based on variant
  const logoSrc = variant === 'dark' 
    ? '/logo-dark.png' 
    : variant === 'light' 
      ? '/logo-light.png' 
      : '/logo.png';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-start">
        <img
          src={logoSrc}
          alt="Padeliga"
          className={cn('object-contain', sizeClassMap[size])}
        />
        {showTagline && (
          <span className={cn(
            "font-medium italic mt-1 text-xs",
            variant === 'light' ? 'text-white' : variant === 'dark' ? 'text-gray-300' : 'text-gray-500'
          )}>
            Tu liga. Tu juego.
          </span>
        )}
      </div>
    </div>
  );
}

export default PadeligaLogo;