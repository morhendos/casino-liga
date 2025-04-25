import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PadeligaLogoProps {
  variant?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PadeligaLogo({
  variant = 'light',
  size = 'md',
  className
}: PadeligaLogoProps) {
  // Size mappings
  const sizeMap = {
    xs: { width: 100, height: 28 },
    sm: { width: 150, height: 42 },
    md: { width: 180, height: 50 },
    lg: { width: 220, height: 62 },
  };
  
  // Choose logo source based on variant
  const logoSource = variant === 'dark' 
    ? '/logo-padeliga-dark.png' 
    : '/logo-padeliga-light.png';
  
  const { width, height } = sizeMap[size];
  
  return (
    <div className={cn("relative", className)}>
      <Image 
        src={logoSource}
        alt="Padeliga" 
        width={width} 
        height={height}
        className="object-contain"
      />
    </div>
  );
}