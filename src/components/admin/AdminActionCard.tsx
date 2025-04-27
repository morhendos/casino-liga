"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
  className?: string;
}

export function AdminActionCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick, 
  className 
}: AdminActionCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Map color to border and hover styles
  const colorStyles: Record<string, { border: string, hover: string, text: string, bg: string }> = {
    'padeliga-teal': { 
      border: 'border-padeliga-teal/30', 
      hover: 'hover:border-padeliga-teal hover:bg-padeliga-teal/5',
      text: 'text-padeliga-teal',
      bg: 'bg-padeliga-teal/10'
    },
    'padeliga-purple': { 
      border: 'border-padeliga-purple/30', 
      hover: 'hover:border-padeliga-purple hover:bg-padeliga-purple/5',
      text: 'text-padeliga-purple',
      bg: 'bg-padeliga-purple/10'
    },
    'padeliga-orange': { 
      border: 'border-padeliga-orange/30', 
      hover: 'hover:border-padeliga-orange hover:bg-padeliga-orange/5',
      text: 'text-padeliga-orange',
      bg: 'bg-padeliga-orange/10'
    },
    'padeliga-green': { 
      border: 'border-padeliga-green/30', 
      hover: 'hover:border-padeliga-green hover:bg-padeliga-green/5',
      text: 'text-padeliga-green',
      bg: 'bg-padeliga-green/10'
    }
  };

  const styles = colorStyles[color] || colorStyles['padeliga-teal'];
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        `relative overflow-hidden border ${styles.border} ${styles.hover} transition-colors cursor-pointer transform hover:-translate-y-1 duration-200`,
        className
      )}
      style={{ transform: 'skew(-2deg)' }}
    >
      {/* Left border accent */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: `hsl(var(--${color}))` }}
      />

      <div 
        className="p-4 flex flex-col items-center text-center"
        style={{ transform: 'skew(2deg)' }} // Counter-skew the content
      >
        <div className={`h-14 w-14 flex items-center justify-center mb-3 ${styles.bg}`}>
          <Icon className={`h-8 w-8 ${styles.text}`} />
        </div>
        
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export default AdminActionCard;
