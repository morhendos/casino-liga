import React from 'react';
import { cn } from '@/lib/utils';

interface GeometricBackgroundProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'intense';
  animated?: boolean;
}

export function GeometricBackground({
  className,
  variant = 'default',
  animated = true,
}: GeometricBackgroundProps) {
  const opacityMap = {
    default: {
      shape1: 'opacity-10',
      shape2: 'opacity-15',
      shape3: 'opacity-10',
      shape4: 'opacity-5',
    },
    subtle: {
      shape1: 'opacity-5',
      shape2: 'opacity-5',
      shape3: 'opacity-5',
      shape4: 'opacity-3',
    },
    intense: {
      shape1: 'opacity-20',
      shape2: 'opacity-25',
      shape3: 'opacity-20',
      shape4: 'opacity-15',
    },
  };

  const animationMap = {
    shape1: animated ? 'animate-float' : '',
    shape2: animated ? 'animate-float-delay-1' : '',
    shape3: animated ? 'animate-float-delay-2' : '',
    shape4: animated ? 'animate-float-delay-3' : '',
  };

  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      {/* Orange Triangle */}
      <div
        className={cn(
          'absolute -top-20 -left-20 w-60 h-60 bg-padeliga-orange transform rotate-15',
          opacityMap[variant].shape1,
          animationMap.shape1
        )}
      />
      
      {/* Teal Square */}
      <div
        className={cn(
          'absolute top-1/4 right-10 w-40 h-40 bg-padeliga-teal transform -rotate-12',
          opacityMap[variant].shape2,
          animationMap.shape2
        )}
      />
      
      {/* Purple Rectangle */}
      <div
        className={cn(
          'absolute bottom-20 left-1/4 w-60 h-40 bg-padeliga-purple transform rotate-45',
          opacityMap[variant].shape3,
          animationMap.shape3
        )}
      />
      
      {/* Green Parallelogram */}
      <div
        className={cn(
          'absolute top-1/3 left-1/3 w-72 h-56 bg-padeliga-green transform skew-x-12 rotate-12',
          opacityMap[variant].shape4,
          animationMap.shape4
        )}
      />
      
      {/* Red Triangle */}
      <div
        className={cn(
          'absolute -bottom-10 -right-10 w-40 h-40 bg-padeliga-red transform -rotate-15',
          opacityMap[variant].shape1,
          animationMap.shape4
        )}
      />
    </div>
  );
}

export default GeometricBackground;