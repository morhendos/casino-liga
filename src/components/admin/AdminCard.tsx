"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  color?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  contentClassName?: string;
}

export function AdminCard({
  title,
  description,
  icon: Icon,
  color = "padeliga-teal",
  children,
  className,
  headerAction,
  contentClassName,
}: AdminCardProps) {
  return (
    <Card className={cn(
      "border-0 overflow-hidden shadow-sm",
      `border-t-4 border-t-${color}`,
      className
    )}>
      <CardHeader className="bg-muted/20 flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center text-xl font-bold">
            {Icon && <Icon className={`h-5 w-5 mr-2 text-${color}`} />}
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1">
              {description}
            </CardDescription>
          )}
        </div>
        {headerAction && (
          <div>
            {headerAction}
          </div>
        )}
      </CardHeader>
      <CardContent className={cn("p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

interface AdminActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  actionLabel: string;
  onClick: () => void;
  className?: string;
}

export function AdminActionCard({
  title,
  description,
  icon: Icon,
  color = "padeliga-teal",
  actionLabel,
  onClick,
  className,
}: AdminActionCardProps) {
  return (
    <Card className={cn(
      "border-0 h-full overflow-hidden transition-all duration-300 hover:shadow-md",
      `border-l-4 border-l-${color}`,
      className
    )}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center">
          <Icon className={`h-5 w-5 mr-2 text-${color}`} />
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
        <Button 
          variant="ghost" 
          className={`text-sm text-${color} hover:text-${color} hover:bg-${color}/10 p-0 h-8`}
          onClick={onClick}
        >
          {actionLabel}
          <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </CardContent>
    </Card>
  );
}

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  color = "padeliga-teal",
  trend,
  className,
}: AdminStatCardProps) {
  return (
    <Card className={cn(
      "border-0 overflow-hidden transition-all duration-300 hover:shadow-sm",
      `border-l-4 border-l-${color}`,
      className
    )}>
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
}

export default AdminCard;