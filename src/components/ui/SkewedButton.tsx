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
  buttonVariant = "default",
  buttonSize = "default",
  hoverEffectColor = "teal",
  hoverEffectVariant = "outline",
  skewAngle = 354, // Default to the 354deg skew used in the login page
  className,
  asChild = false,
  ...props
}: SkewedButtonProps) {
  return (
    <div
      className="relative overflow-hidden group"
      style={{ transform: `skewX(${skewAngle}deg)` }}
    >
      <Button
        variant={buttonVariant as any}
        size={buttonSize as any}
        className={cn("relative z-10", className)}
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
