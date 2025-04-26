import React from 'react';
import { Button, ButtonProps, buttonVariants } from './button';
import ButtonHoverEffect from './ButtonHoverEffect';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

// We directly use the types from the Button component
export interface SkewedButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  /**
   * The visual style variant of the button 
   */
  variant?: VariantProps<typeof buttonVariants>['variant'];
  
  /**
   * The size of the button
   */
  size?: VariantProps<typeof buttonVariants>['size'];
  
  /**
   * Color for hover effect
   */
  hoverEffectColor?: 'teal' | 'purple' | 'orange';
  
  /**
   * Type of hover effect
   */
  hoverEffectVariant?: 'outline' | 'solid';
  
  /**
   * Skew transformation angle in degrees
   */
  skewAngle?: number;
  
  /**
   * For backward compatibility with previous prop names
   * @deprecated Use 'variant' instead
   */
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
  
  /**
   * For backward compatibility with previous prop names
   * @deprecated Use 'size' instead
   */
  buttonSize?: VariantProps<typeof buttonVariants>['size'];
}

/**
 * SkewedButton provides a distinctive button style with a skew transformation 
 * and hover effects that match the angular aesthetic of the Padeliga brand.
 * 
 * @example
 * ```jsx
 * // Primary CTA button with solid hover effect
 * <SkewedButton
 *   variant="orange"
 *   size="xl"
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
 * 
 * // Secondary outline button with outline hover effect
 * <SkewedButton
 *   variant="ghost"
 *   size="lg"
 *   hoverEffectColor="teal"
 *   hoverEffectVariant="outline"
 *   className="border border-padeliga-teal text-padeliga-teal"
 * >
 *   Ver todas las características
 * </SkewedButton>
 * ```
 */
export const SkewedButton = React.forwardRef<HTMLButtonElement, SkewedButtonProps>(
  ({ 
    className, 
    children, 
    // New prop names
    variant,
    size,
    // Old prop names for backward compatibility
    buttonVariant,
    buttonSize,
    // Other props
    hoverEffectColor = 'teal',
    hoverEffectVariant = 'outline',
    skewAngle = 354, // Default skew angle (354 degrees or -6 degrees)
    ...props 
  }, ref) => {
    // For backward compatibility use buttonVariant/buttonSize if provided
    const finalVariant = variant || buttonVariant || 'default';
    const finalSize = size || buttonSize || 'default';
    
    // Convert skew angle to CSS transform value
    // Note: 354 degrees is equivalent to -6 degrees
    const skewTransform = `skewX(${skewAngle - 360}deg)`;
    
    return (
      <div 
        className={cn(
          "relative inline-block group overflow-hidden transform",
          "transition-transform hover:translate-y-[-2px]"
        )}
        style={{ transform: skewTransform }}
      >
        <Button
          ref={ref}
          variant={finalVariant as any}
          size={finalSize as any}
          className={cn(
            "relative z-10 transform", 
            "border-0",
            className
          )}
          {...props}
        >
          {children}
        </Button>
        
        {/* Hover effect layer */}
        <ButtonHoverEffect 
          variant={hoverEffectVariant} 
          color={hoverEffectColor}
          className="z-0"
        />
      </div>
    );
  }
);

SkewedButton.displayName = 'SkewedButton';

export default SkewedButton;