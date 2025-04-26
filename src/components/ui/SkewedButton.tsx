import React from 'react';
import { Button } from '@/components/ui/button';
import ButtonHoverEffect from '@/components/ui/ButtonHoverEffect';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'teal' | 'orange' | 'purple' | 'green' | 'red' | 'cta' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';
type HoverEffectColor = 'teal' | 'purple' | 'orange' | 'white';
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
 * This component combines the standard Button with ButtonHoverEffect and applies
 * a skew transformation for a distinctive look consistent with the Padeliga brand.
 * 
 * @example
 * <SkewedButton
 *   buttonVariant="orange"
 *   buttonSize="xl"
 *   hoverEffectColor="orange"
 *   hoverEffectVariant="solid"
 *   className="text-white font-bold"
 *   asChild
 * >
 *   <Link href="/signup">
 *     Comenzar Ahora
 *     <ChevronRight className="ml-1 h-5 w-5" />
 *   </Link>
 * </SkewedButton>
 */
export function SkewedButton({
  children,
  buttonVariant = 'default',
  buttonSize = 'default',
  hoverEffectColor,
  hoverEffectVariant = 'outline',
  skewAngle = 354, // Default to the 354deg skew used in the login page
  className,
  asChild = false,
  ...props
}: SkewedButtonProps) {
  // Determine hover effect color based on button variant if not explicitly provided
  const effectColor = hoverEffectColor || mapButtonVariantToEffectColor(buttonVariant);
  
  // Content needs to be counter-skewed to appear normal
  const contentSkewAngle = 360 - skewAngle;
  
  // Determine if this is a white/light button to set proper effect variant
  // White buttons should always use white corner accents
  const isLightButton = buttonVariant === 'outline' || buttonVariant === 'ghost' || 
                         buttonVariant === 'default' || buttonVariant === 'secondary';
  
  const effectColorToUse = isLightButton && !hoverEffectColor ? 'white' : effectColor;
  
  return (
    <div 
      className="relative inline-block overflow-visible group" 
      style={{ transform: `skewX(${skewAngle}deg)` }}
    >
      {/* Button wrapper to apply the counter-skew */}
      <div className="relative z-10" style={{ transform: `skewX(${contentSkewAngle}deg)` }}>
        <Button
          variant={buttonVariant as any}
          size={buttonSize as any}
          className={cn("relative", className)}
          asChild={asChild}
          {...props}
        >
          {children}
        </Button>
      </div>
      
      {/* Hover effect positioned absolutely relative to the container */}
      <ButtonHoverEffect 
        variant={hoverEffectVariant}
        color={effectColorToUse}
      />
    </div>
  );
}

/**
 * Maps button variants to appropriate hover effect colors
 */
function mapButtonVariantToEffectColor(variant: ButtonVariant): HoverEffectColor {
  switch (variant) {
    case 'teal':
      return 'teal';
    case 'orange':
    case 'cta':
      return 'orange';
    case 'purple':
      return 'purple';
    case 'outline':
    case 'ghost':
    case 'default':
    case 'secondary':
      return 'white';
    default:
      return 'teal'; // Default fallback
  }
}

export default SkewedButton;