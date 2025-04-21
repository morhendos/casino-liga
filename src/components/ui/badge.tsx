import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: 
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        // Logo-inspired variants
        teal: 
          "border-transparent bg-padeliga-teal/90 text-white hover:bg-padeliga-teal",
        orange: 
          "border-transparent bg-padeliga-orange/90 text-white hover:bg-padeliga-orange",
        purple: 
          "border-transparent bg-padeliga-purple/90 text-white hover:bg-padeliga-purple",
        green: 
          "border-transparent bg-padeliga-green/90 text-white hover:bg-padeliga-green",
        red: 
          "border-transparent bg-padeliga-red/90 text-white hover:bg-padeliga-red",
        gradient:
          "border-transparent bg-padeliga-gradient text-white",
        // Subtle variants with transparent backgrounds
        "teal-subtle": 
          "border-padeliga-teal/30 bg-padeliga-teal/10 text-padeliga-teal hover:bg-padeliga-teal/20",
        "orange-subtle": 
          "border-padeliga-orange/30 bg-padeliga-orange/10 text-padeliga-orange hover:bg-padeliga-orange/20",
        "purple-subtle": 
          "border-padeliga-purple/30 bg-padeliga-purple/10 text-padeliga-purple hover:bg-padeliga-purple/20",
        "green-subtle": 
          "border-padeliga-green/30 bg-padeliga-green/10 text-padeliga-green hover:bg-padeliga-green/20",
        "red-subtle": 
          "border-padeliga-red/30 bg-padeliga-red/10 text-padeliga-red hover:bg-padeliga-red/20",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }