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
    : 'border-white'; // Removed opacity for full white borders
    
  const firstLayerColor = variant === 'outline'
    ? {
        teal: 'bg-padeliga-teal/5',
        purple: 'bg-padeliga-purple/5',
        orange: 'bg-padeliga-orange/5'
      }[color]
    : {
        teal: 'bg-white/30',  // Significantly increased opacity to 30%
        purple: 'bg-white/30',
        orange: 'bg-white/30'
      }[color];
    
  const secondLayerColor = variant === 'outline'
    ? {
        teal: 'bg-padeliga-teal/10',
        purple: 'bg-padeliga-purple/10',
        orange: 'bg-padeliga-orange/10'
      }[color]
    : {
        teal: 'bg-white/40',  // Significantly increased opacity to 40%
        purple: 'bg-white/40',
        orange: 'bg-white/40'
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
      
      {/* Animated corner effects - larger for solid buttons */}
      <div className={cn(
        "absolute top-0 left-0 w-0 h-0 border-t-[12px] border-l-[12px] group-hover:w-16 group-hover:h-16 transition-all duration-300", // Significantly increased size
        cornerBorderColor
      )}></div>
      <div className={cn(
        "absolute bottom-0 right-0 w-0 h-0 border-b-[12px] border-r-[12px] group-hover:w-16 group-hover:h-16 transition-all duration-300", // Significantly increased size
        cornerBorderColor
      )}></div>
      
      {/* Add more dramatic shine effect for solid buttons */}
      {variant === 'solid' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-800 ease-in-out"></div>
      )}
    </div>
  );
}

export default ButtonHoverEffect;