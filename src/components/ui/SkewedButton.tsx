import React from "react";
import { Button } from "@/components/ui/button";
import ButtonHoverEffect from "@/components/ui/ButtonHoverEffect";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "teal"
  | "orange"
  | "purple"
  | "green"
  | "red"
  | "white"
  | "cta"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "xl" | "icon";
type HoverEffectColor = "teal" | "purple" | "orange" | "white";
type HoverEffectVariant = "outline" | "solid";

interface SkewedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  buttonVariant?: ButtonVariant;
  buttonSize?: ButtonSize;
  hoverEffectColor?: HoverEffectColor;
  hoverEffectVariant?: HoverEffectVariant;
  skewAngle?: number; // Allow customizing the skew angle if needed
  className?: string;
  asChild?: boolean;
  fullWidth?: boolean; // Added fullWidth prop for mobile buttons
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
 *   className="font-bold"
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
  buttonVariant = "default",
  buttonSize = "default",
  hoverEffectColor = "teal",
  hoverEffectVariant = "outline",
  skewAngle = 354, // Default to the 354deg skew used in the login page
  className,
  asChild = false,
  fullWidth = false,
  ...props
}: SkewedButtonProps) {
  // Define variant-specific styles to avoid having to add them in the className
  const variantStyles = {
    outline:
      buttonVariant === "outline"
        ? {
            teal: "border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent",
            purple:
              "border border-padeliga-purple text-padeliga-purple bg-transparent hover:bg-transparent",
            orange:
              "border border-padeliga-orange text-padeliga-orange bg-transparent hover:bg-transparent",
            white:
              "border border-white text-white bg-transparent hover:bg-transparent",
          }[hoverEffectColor] ||
          "border border-padeliga-teal text-padeliga-teal bg-transparent hover:bg-transparent"
        : "",
    teal: buttonVariant === "teal" ? "text-white" : "",
    purple: buttonVariant === "purple" ? "text-white" : "",
    orange: buttonVariant === "orange" ? "text-white" : "",
    green: buttonVariant === "green" ? "text-white" : "",
    red: buttonVariant === "red" ? "text-white" : "",
    cta: buttonVariant === "cta" ? "text-white" : "",
    destructive: buttonVariant === "destructive" ? "text-white" : "",
    // Add other variants as needed
  };

  // Get the appropriate styles based on the button variant
  const variantStyle =
    variantStyles[buttonVariant as keyof typeof variantStyles] || "";

  // Default spacing that should be applied to all buttons
  const defaultSpacing = "px-6 py-2";

  // Apply full width if specified
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <div
      className={cn("relative overflow-hidden group", fullWidth && "w-full")}
      style={{ transform: `skewX(${skewAngle}deg)` }}
    >
      <Button
        variant={buttonVariant as any}
        size={buttonSize as any}
        className={cn(
          "relative z-10",
          variantStyle,
          defaultSpacing,
          widthClass,
          className
        )}
        asChild={asChild}
        {...props}
      >
        {children}
      </Button>
      <ButtonHoverEffect
        variant={hoverEffectVariant}
        color={hoverEffectColor}
      />
    </div>
  );
}

export default SkewedButton;
