"use client";

import { cn } from "@/lib/utils";

export default function GradientBackground() {
  return (
    <>
      <div
        className={cn(
          "fixed hidden md:block inset-0 -z-10 h-full w-full items-center px-5 py-24",
          "bg-[radial-gradient(circle_at_top_right,hsl(var(--primary))_0%,transparent_20%),radial-gradient(circle_at_bottom_left,hsl(var(--primary))_0%,transparent_30%)]",
          "dark:bg-[radial-gradient(circle_at_top_right,hsl(var(--primary))_0%,transparent_30%),radial-gradient(circle_at_bottom_left,hsl(var(--primary))_0%,transparent_40%)]",
          "opacity-20"
        )}
      />
      <div
        className={cn(
          "fixed hidden md:block h-32 w-32 md:h-40 md:w-40 rounded-full",
          "bg-primary/30 dark:bg-primary/20",
          "blur-3xl",
          "top-1/4 right-1/3",
          "-z-10"
        )}
      />
      <div
        className={cn(
          "fixed hidden md:block h-32 w-32 md:h-64 md:w-64 rounded-full",
          "bg-primary/30 dark:bg-primary/20",
          "blur-3xl",
          "top-2/3 left-1/4",
          "-z-10"
        )}
      />
    </>
  );
}
