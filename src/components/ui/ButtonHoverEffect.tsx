import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonHoverEffectProps {
  variant?: 'outline' | 'solid';
  color?: 'teal' | 'purple' | 'orange';
  className?: string;
}

/**
 * Reusable component for the geometric corner and layer effects on buttons
 * Can be used for both outline and solid buttons with appropriate color adjustments
 */
export function ButtonHoverEffect({ 
  variant = 'outline',
  color = 'teal',
  className
}: ButtonHoverEffectProps) {
  // Define colors based on variant and color prop
  const cornerBorderColor = variant === 'outline' 
    ? {
        teal: 'border-padeliga-teal/60',
        purple: 'border-padeliga-purple/60',
        orange: 'border-padeliga-orange/60'
      }[color]
    : 'border-white/70'; // For solid buttons, always use white with opacity
    
  const firstLayerColor = variant === 'outline'
    ? {
        teal: 'bg-padeliga-teal/5',
        purple: 'bg-padeliga-purple/5',
        orange: 'bg-padeliga-orange/5'
      }[color]
    : {
        teal: 'bg-white/5',
        purple: 'bg-white/5',
        orange: 'bg-white/5'
      }[color];
    
  const secondLayerColor = variant === 'outline'
    ? {
        teal: 'bg-padeliga-teal/10',
        purple: 'bg-padeliga-purple/10',
        orange: 'bg-padeliga-orange/10'
      }[color]
    : {
        teal: 'bg-white/10',
        purple: 'bg-white/10',
        orange: 'bg-white/10'
      }[color];
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* First layer - diagonal trapezoid */}
      <div className={cn(
        "absolute -top-full left-0 right-0 h-[200%] transform skew-y-12 group-hover:top-0 transition-all ease-out duration-300",
        firstLayerColor
      )}></div>
      
      {/* Second layer - bottom triangle */}
      <div className={cn(
        "absolute top-full left-0 right-0 h-full group-hover:top-1/2 transition-all ease-out duration-500 delay-100",
        secondLayerColor
      )}></div>
      
      {/* Animated corner effects */}
      <div className={cn(
        "absolute top-0 left-0 w-0 h-0 border-t-[8px] border-l-[8px] group-hover:w-8 group-hover:h-8 transition-all duration-300",
        cornerBorderColor
      )}></div>
      <div className={cn(
        "absolute bottom-0 right-0 w-0 h-0 border-b-[8px] border-r-[8px] group-hover:w-8 group-hover:h-8 transition-all duration-300",
        cornerBorderColor
      )}></div>
    </div>
  );
}

export default ButtonHoverEffect;