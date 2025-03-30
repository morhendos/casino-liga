"use client";

import ThemeToggle from "@/components/ThemeToggle";

export function HeaderControls() {
  return (
    <div className="flex justify-end gap-2">
      <ThemeToggle />
    </div>
  );
}
