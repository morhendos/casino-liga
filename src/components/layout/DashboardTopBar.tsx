"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';
import { UserAccountNav } from '@/components/auth/UserAccountNav';

type DashboardTopBarProps = {
  className?: string;
};

export function DashboardTopBar({ 
  className
}: DashboardTopBarProps) {
  const { data: session } = useSession();
  
  return (
    <div className={cn(
      "flex justify-between items-center h-14 px-4 bg-background dark:bg-slate-900 backdrop-blur-sm border-b border-border z-50 sticky top-0",
      className
    )}>
      <div className="flex-1">
        {/* Left side - empty now that search is removed */}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <ThemeToggle />
        
        {session?.user && (
          <UserAccountNav
            user={{
              name: session.user.name || null,
              image: session.user.image || null,
              email: session.user.email || "",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DashboardTopBar;