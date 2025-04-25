import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'teal' | 'orange' | 'purple' | 'green' | 'red' | 'cta' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';
type HoverEffectColor = 'teal' | 'purple' | 'orange';
type HoverEffectVariant = 'outline' | 'solid';

interface SkewedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  hoverEffectColor?: HoverEffectColor;
  hoverEffectVariant?: HoverEffectVariant;
  skewAngle?: number; // Allow customizing the skew angle if needed
  className?: string;
  asChild?: boolean;
}

/**
 * SkewedButton - A reusable button component with skew transformation and hover effects
 * 
 * This component combines the standard Button with hover effects and applies
 * a skew transformation for a distinctive look consistent with the Padeliga brand.
 */
export function SkewedButton({
  children,
  buttonVariant = 'default',
  buttonSize = 'default',
  hoverEffectColor = 'teal',
  hoverEffectVariant = 'outline',
  skewAngle = 354, // Default to the 354deg skew
  className,
  asChild = false,
  ...props
}: SkewedButtonProps) {
  
  // Define hover effect colors
  const getHoverBgColor = () => {
    if (hoverEffectVariant === 'outline') {
      return {
        teal: 'group-hover:bg-padeliga-teal/10',
        purple: 'group-hover:bg-padeliga-purple/10',
        orange: 'group-hover:bg-padeliga-orange/10',
      }[hoverEffectColor];
    } else {
      return {
        teal: 'group-hover:bg-padeliga-teal/90',
        purple: 'group-hover:bg-padeliga-purple/90',
        orange: 'group-hover:bg-padeliga-orange/90',
      }[hoverEffectColor];
    }
  };

  return (
    <div 
      className="relative overflow-hidden group" 
      style={{ transform: `skewX(${skewAngle}deg)` }}
    >
      <Button
        variant={buttonVariant as any}
        size={buttonSize as any}
        className={cn(
          "relative z-10",
          buttonVariant === 'ghost' && "hover:bg-transparent",
          className
        )}
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
      
      {/* Simple hover effect without corner boxes */}
      <div className={cn(
        "absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100",
        getHoverBgColor()
      )}></div>
    </div>
  );
}

export default SkewedButton;