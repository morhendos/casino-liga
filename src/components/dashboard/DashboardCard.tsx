"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  className?: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  className,
  stats
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden border-0 card-highlight transition-all duration-300 group hover:shadow-md",
      className
    )}>
      <div className="h-full p-6 relative">
        {/* Colored top border matching the logo brand colors */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-${color}`} />
        
        {/* Icon with matching color background */}
        <div className={`inline-flex items-center justify-center p-2 rounded-none bg-${color}/10 mb-4`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
        
        {/* Card content */}
        <h2 className={`text-xl font-bold mb-2 group-hover:text-${color} transition-colors`}>
          {title}
        </h2>
        
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
        
        {/* Optional stats display */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 my-4 py-3 border-y">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-xl font-bold text-${color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        
        {/* Action button */}
        <div className="mt-auto pt-2">
          <Button 
            variant="ghost" 
            asChild 
            className={`group-hover:text-${color} transition-colors p-0 h-auto font-semibold`}
          >
            <Link href={href} className="flex items-center">
              <span>Go to {title}</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default DashboardCard;