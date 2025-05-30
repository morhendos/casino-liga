"use client";

import React, { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [initialTheme, setInitialTheme] = useState<string | null>(null);
  
  // On first render, immediately check localStorage for theme
  useEffect(() => {
    // Check localStorage directly to get theme before hydration
    if (typeof window !== 'undefined') {
      // First try the next-theme stored value
      const storedTheme = localStorage.getItem('theme');
      // If no stored theme, try to detect system preference
      if (!storedTheme || storedTheme === 'system') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setInitialTheme(isDarkMode ? 'dark' : 'light');
      } else {
        setInitialTheme(storedTheme);
      }
    }
    
    // Then mark as mounted to use the theme provider's value going forward
    setMounted(true);
  }, []);
  
  // Determine the current theme to use
  const currentTheme = mounted ? resolvedTheme : initialTheme;
  const isDark = currentTheme === 'dark';
  
  // If we have no theme information yet, render a simple placeholder
  if (!mounted && !initialTheme) {
    return (
      <div className={cn(
        "relative h-full overflow-hidden border border-border bg-card animate-pulse",
        className
      )}>
        <div className="h-full px-5 py-4 flex flex-col items-start">
          <div className="h-8 w-8 mb-2 mt-1 rounded-sm bg-muted" />
          <div className="flex flex-col w-full">
            <div className="h-8 w-3/4 mb-1 bg-muted rounded-sm" />
            <div className="h-4 w-1/2 bg-muted rounded-sm" />
          </div>
        </div>
      </div>
    );
  }
  
  // Map color string to actual color values for both themes
  const colorMap: Record<string, { 
    darkBg: string, 
    lightBg: string, 
    text: string, 
    accent: string,
    borderDark: string,
    borderLight: string
  }> = {
    'padeliga-teal': { 
      darkBg: 'bg-gradient-to-br from-[#1a3264] to-[#1e4587]', 
      lightBg: 'bg-gradient-to-br from-[#e0f2ff] to-[#c5e3ff]',
      text: 'text-padeliga-teal', 
      accent: 'before:border-[#1e4587]',
      borderDark: 'border-[#1e4587]',
      borderLight: 'border-[#4d80d0]'
    },
    'padeliga-orange': { 
      darkBg: 'bg-gradient-to-br from-[#664010] to-[#8c5615]', 
      lightBg: 'bg-gradient-to-br from-[#fff4e0] to-[#ffe9c5]',
      text: 'text-padeliga-orange', 
      accent: 'before:border-[#f2af3a]',
      borderDark: 'border-[#8c5615]',
      borderLight: 'border-[#f2af3a]'
    },
    'padeliga-purple': { 
      darkBg: 'bg-gradient-to-br from-[#4b1e73] to-[#63289a]', 
      lightBg: 'bg-gradient-to-br from-[#f4e0ff] to-[#e9c5ff]',
      text: 'text-padeliga-purple', 
      accent: 'before:border-[#a559e1]',
      borderDark: 'border-[#63289a]',
      borderLight: 'border-[#a559e1]'
    },
    'padeliga-green': { 
      darkBg: 'bg-gradient-to-br from-[#3f5f1a] to-[#4c7420]', 
      lightBg: 'bg-gradient-to-br from-[#f0ffe0] to-[#e0ffc5]',
      text: 'text-padeliga-green', 
      accent: 'before:border-[#bff061]',
      borderDark: 'border-[#4c7420]',
      borderLight: 'border-[#8abf2d]'
    }
  };
  
  const colors = colorMap[color] || colorMap['padeliga-teal'];
  const bg = isDark ? colors.darkBg : colors.lightBg;
  const borderColor = isDark ? colors.borderDark : colors.borderLight;
  const textColor = isDark ? 'text-white' : `text-gray-800`;
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-600';

  // Use CSS variables for theme-aware styling
  const cardClass = cn(
    "relative h-full overflow-hidden border",
    isDark ? "border-slate-700" : "border-slate-200",
    className
  );
  
  return (
    <div className={cardClass} data-theme={currentTheme}>
      {/* Background with theme-aware styling */}
      <div className={cn(
        "absolute inset-0 -z-10",
        bg
      )}
      style={{ transform: 'skew(-4deg) scale(1.1)' }}
      />
      
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
      
      <div className="h-full px-5 py-4 flex flex-col items-start">
        <Icon className={`${colors.text} h-8 w-8 mb-2 mt-1`} />
        
        <div className="flex flex-col">
          <span className={`text-4xl font-bold ${textColor} mb-1`}>{value}</span>
          <span className={`${subTextColor} text-sm`}>{title}</span>
        </div>
      </div>
    </div>
  );
}

export default SkewedStatCard;