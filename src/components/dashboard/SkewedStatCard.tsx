"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkewedStatCardProps {
  value: string;
  title: string;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export function SkewedStatCard({ 
  value, 
  title, 
  icon: Icon, 
  color, 
  className 
}: SkewedStatCardProps) {
  // Map color string to actual color values
  const colorMap: Record<string, { bg: string, text: string, accent: string }> = {
    'padeliga-teal': { 
      bg: 'bg-gradient-to-br from-[#1a3264] to-[#1e4587]', 
      text: 'text-padeliga-teal', 
      accent: 'before:border-[#1e4587]'
    },
    'padeliga-orange': { 
      bg: 'bg-gradient-to-br from-[#664010] to-[#8c5615]', 
      text: 'text-padeliga-orange', 
      accent: 'before:border-[#f2af3a]'
    },
    'padeliga-purple': { 
      bg: 'bg-gradient-to-br from-[#4b1e73] to-[#63289a]', 
      text: 'text-padeliga-purple', 
      accent: 'before:border-[#a559e1]'
    },
    'padeliga-green': { 
      bg: 'bg-gradient-to-br from-[#3f5f1a] to-[#4c7420]', 
      text: 'text-padeliga-green', 
      accent: 'before:border-[#bff061]'
    }
  };
  
  const colors = colorMap[color] || colorMap['padeliga-teal'];
  
  return (
    <div 
      className={cn(
        "relative h-full overflow-hidden",
        colors.bg,
        className
      )}
      style={{ transform: 'skew(-4deg)' }}
    >
      {/* Corner accent */}
      <div 
        className={`absolute top-0 right-0 w-20 h-20 ${colors.text} opacity-20`}
        style={{ 
          transform: 'rotate(45deg) translate(40%, -40%)',
          background: `hsl(var(--${color}))` 
        }}
      />
      
      {/* Left border accent */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1.5`}
        style={{ background: `hsl(var(--${color}))` }}
      />
      
      <div 
        className="h-full px-5 py-4 flex flex-col items-start"
        style={{ transform: 'skew(4deg)' }} // Counter-skew the content
      >
        <Icon className={`${colors.text} h-8 w-8 mb-2 mt-1`} />
        
        <div className="flex flex-col">
          <span className="text-4xl font-bold text-white mb-1">{value}</span>
          <span className="text-gray-300 text-sm">{title}</span>
        </div>
      </div>
    </div>
  );
}

export default SkewedStatCard;
