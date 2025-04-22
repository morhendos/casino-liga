import React, { useEffect, useState } from 'react';
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
  // Add client-side only animation to prevent hydration issues
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const opacityMap = {
    default: {
      shape1: 'opacity-10',
      shape2: 'opacity-15',
      shape3: 'opacity-10',
      shape4: 'opacity-5',
      shape5: 'opacity-8',
    },
    subtle: {
      shape1: 'opacity-5',
      shape2: 'opacity-5',
      shape3: 'opacity-5',
      shape4: 'opacity-3',
      shape5: 'opacity-4',
    },
    intense: {
      shape1: 'opacity-20',
      shape2: 'opacity-25',
      shape3: 'opacity-20',
      shape4: 'opacity-15',
      shape5: 'opacity-18',
    },
  };

  // Only apply animations on the client side
  const animationMap = {
    shape1: isClient && animated ? 'animate-float' : '',
    shape2: isClient && animated ? 'animate-float-delay-1' : '',
    shape3: isClient && animated ? 'animate-float-delay-2' : '',
    shape4: isClient && animated ? 'animate-float-delay-3' : '',
    shape5: isClient && animated ? 'animate-float-delay-4' : '',
  };

  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      {/* Orange Shape */}
      <div
        className={cn(
          'absolute -top-20 -left-20 w-64 h-64 bg-padeliga-orange',
          opacityMap[variant].shape1,
          animationMap.shape1
        )}
      />
      
      {/* Teal Rectangle */}
      <div
        className={cn(
          'absolute top-1/4 right-10 w-48 h-48 bg-padeliga-teal',
          opacityMap[variant].shape2,
          animationMap.shape2
        )}
      />
      
      {/* Purple Shape */}
      <div
        className={cn(
          'absolute bottom-20 left-1/4 w-64 h-48 bg-padeliga-purple',
          opacityMap[variant].shape3,
          animationMap.shape3
        )}
      />
      
      {/* Green Shape */}
      <div
        className={cn(
          'absolute top-1/3 left-1/3 w-80 h-64 bg-padeliga-green',
          opacityMap[variant].shape4,
          animationMap.shape4
        )}
      />
      
      {/* Red Shape */}
      <div
        className={cn(
          'absolute -bottom-10 -right-10 w-48 h-48 bg-padeliga-red',
          opacityMap[variant].shape1,
          animationMap.shape5
        )}
      />
      
      {/* Additional Teal Shape */}
      <div
        className={cn(
          'absolute top-2/3 right-1/4 w-32 h-32 bg-padeliga-teal',
          opacityMap[variant].shape5,
          animationMap.shape2
        )}
      />
      
      {/* Additional Orange Shape */}
      <div
        className={cn(
          'absolute top-1/2 -left-10 w-40 h-40 bg-padeliga-orange',
          opacityMap[variant].shape5,
          animationMap.shape3
        )}
      />
    </div>
  );
}

export default GeometricBackground;