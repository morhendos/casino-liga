"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  Plus, 
  Settings, 
  Calendar, 
  HelpCircle 
} from "lucide-react";
import { cn } from '@/lib/utils';

type AdminTopBarProps = {
  title?: string;
  onCreateClick?: () => void;
  className?: string;
};

export function AdminTopBar({ 
  title = "Admin Dashboard", 
  onCreateClick,
  className
}: AdminTopBarProps) {
  // Get current date in a nice format
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return (
    <div className={cn(
      "flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-6 mb-6 bg-card/80 backdrop-blur-sm border-b",
      className
    )}>
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="mr-4">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="hidden md:flex relative flex-1 max-w-xs mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full bg-background pl-8 pr-4 py-2 text-sm transition-colors rounded-none focus:outline-none focus:ring-0 border border-input"
          />
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-muted/50"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-padeliga-orange"
          >
            3
          </Badge>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted/50"
        >
          <Calendar className="h-5 w-5" />
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
          className="hover:bg-muted/50 md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted/50"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={onCreateClick}
          className="bg-padeliga-teal hover:bg-padeliga-teal/90 ml-2 hidden sm:flex"
        >
          <Plus className="mr-1 h-4 w-4" />
          Create New
        </Button>
      </div>
    </div>
  );
}

export default AdminTopBar;
