import React from "react";
import { cn } from "@/lib/utils";

interface PadeligaLogoProps {
  className?: string;
  variant?: "default" | "light" | "dark";
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function PadeligaLogo({
  className,
  variant = "default",
  showTagline = true,
  size = "md",
}: PadeligaLogoProps) {
  const sizeClassMap = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const containerClass = cn("inline-block", sizeClassMap[size], className);

  const backgroundClass = variant === "dark" ? "bg-gray-800" : "bg-transparent";

  // For simplicity, we'll just return the logo as a styled image
  // In a real implementation, this could be an actual SVG component
  // directly in the code rather than using an img tag
  return (
    <div className={containerClass}>
      {variant === "dark" ? (
        <div className={`relative ${backgroundClass} p-2 rounded-md`}>
          <img
            src="/logo-padeliga-dark.png"
            alt="Padeliga"
            className="h-full w-auto"
          />
          {showTagline && (
            <p className="text-center text-white text-xs mt-1">
              TU LIGA. TU JUEGO.
            </p>
          )}
        </div>
      ) : (
        <div className="relative">
          <img
            src="/logo-padeliga-light.png"
            alt="Padeliga"
            className="h-full w-auto"
          />
          {showTagline && (
            <p
              className={`text-center text-xs mt-1 ${
                variant === "light" ? "text-white" : "text-gray-800"
              }`}
            >
              TU LIGA. TU JUEGO.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PadeligaLogo;
