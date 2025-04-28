"use client";

import React from 'react';
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatItem({ title, value, icon: Icon, color, trend }: StatItemProps) {
  return (
    <div className="p-6 bg-paper border-0 relative overflow-hidden group transition-all hover:shadow-sm">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${color}`} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className={`text-2xl font-bold mt-2 text-${color}`}>{value}</h4>
          
          {trend && (
            <p className={`text-xs mt-1 ${trend.isPositive ? 'text-padeliga-green' : 'text-padeliga-red'} flex items-center`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-muted-foreground ml-1">from last period</span>
            </p>
          )}
        </div>
        
        <div className={`p-2 rounded-none bg-${color}/10`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  stats: StatItemProps[];
  className?: string;
}

export function DashboardStats({ stats, className }: DashboardStatsProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <StatItem key={index} {...stat} />
      ))}
    </div>
  );
}

export default DashboardStats;