import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "info";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
    
    // Define progress indicator color based on variant
    const getIndicatorClass = () => {
      switch (variant) {
        case "success":
          return "bg-green-600";
        case "info":
          return "bg-blue-600";
        default:
          return "bg-primary";
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
          className
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-300",
            getIndicatorClass()
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };