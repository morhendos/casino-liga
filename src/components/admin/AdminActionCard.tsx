"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Map color to border and hover styles for both themes
  const colorStyles: Record<string, { 
    darkBorder: string, 
    darkHover: string, 
    darkText: string, 
    darkBg: string,
    lightBorder: string, 
    lightHover: string, 
    lightText: string, 
    lightBg: string
  }> = {
    'padeliga-teal': { 
      darkBorder: 'border-padeliga-teal/30', 
      darkHover: 'hover:border-padeliga-teal hover:bg-padeliga-teal/10',
      darkText: 'text-padeliga-teal',
      darkBg: 'bg-padeliga-teal/10',
      lightBorder: 'border-padeliga-teal/40', 
      lightHover: 'hover:border-padeliga-teal hover:bg-padeliga-teal/5',
      lightText: 'text-padeliga-teal',
      lightBg: 'bg-padeliga-teal/5'
    },
    'padeliga-purple': { 
      darkBorder: 'border-padeliga-purple/30', 
      darkHover: 'hover:border-padeliga-purple hover:bg-padeliga-purple/10',
      darkText: 'text-padeliga-purple',
      darkBg: 'bg-padeliga-purple/10',
      lightBorder: 'border-padeliga-purple/40', 
      lightHover: 'hover:border-padeliga-purple hover:bg-padeliga-purple/5',
      lightText: 'text-padeliga-purple',
      lightBg: 'bg-padeliga-purple/5'
    },
    'padeliga-orange': { 
      darkBorder: 'border-padeliga-orange/30', 
      darkHover: 'hover:border-padeliga-orange hover:bg-padeliga-orange/10',
      darkText: 'text-padeliga-orange',
      darkBg: 'bg-padeliga-orange/10',
      lightBorder: 'border-padeliga-orange/40', 
      lightHover: 'hover:border-padeliga-orange hover:bg-padeliga-orange/5',
      lightText: 'text-padeliga-orange',
      lightBg: 'bg-padeliga-orange/5'
    },
    'padeliga-green': { 
      darkBorder: 'border-padeliga-green/30', 
      darkHover: 'hover:border-padeliga-green hover:bg-padeliga-green/10',
      darkText: 'text-padeliga-green',
      darkBg: 'bg-padeliga-green/10',
      lightBorder: 'border-padeliga-green/40', 
      lightHover: 'hover:border-padeliga-green hover:bg-padeliga-green/5',
      lightText: 'text-padeliga-green',
      lightBg: 'bg-padeliga-green/5'
    }
  };

  const styles = colorStyles[color] || colorStyles['padeliga-teal'];
  const borderStyle = isDark ? styles.darkBorder : styles.lightBorder;
  const hoverStyle = isDark ? styles.darkHover : styles.lightHover;
  const textStyle = isDark ? styles.darkText : styles.lightText;
  const bgStyle = isDark ? styles.darkBg : styles.lightBg;
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        `relative overflow-hidden border ${borderStyle} ${hoverStyle} transition-colors cursor-pointer transform hover:-translate-y-1 duration-200`,
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
        <div className={`h-14 w-14 flex items-center justify-center mb-3 ${bgStyle}`}>
          <Icon className={`h-8 w-8 ${textStyle}`} />
        </div>
        
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

export default AdminActionCard;
