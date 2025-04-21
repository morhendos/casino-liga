import React from 'react';
import { cn } from '@/lib/utils';

interface PadeligaLogoProps {
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PadeligaLogo({
  className,
  variant = 'default',
  size = 'md',
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
    sizeClassMap[size],
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
      <img
        src={logoSrc}
        alt="Padeliga"
        className="h-full w-auto object-contain"
      />
    </div>
  );
}

export default PadeligaLogo;