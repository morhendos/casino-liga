"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle 
} from "lucide-react";
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
      <div className="hidden md:flex relative flex-1 max-w-xs">
        <Search className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          className="h-9 w-full bg-muted/30 pl-9 pr-4 py-2 text-sm transition-colors rounded-none focus:outline-none focus:ring-0 border border-input/50"
        />
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted/50"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-padeliga-orange"
          >
            2
          </Badge>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted/50 md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted/50"
        >
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted/50"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        
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