"use client";

import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface SkewedActionButtonProps {
  label: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function SkewedActionButton({ 
  label, 
  icon: Icon, 
  color, 
  href, 
  onClick,
  className 
}: SkewedActionButtonProps) {
  const { resolvedTheme } = useTheme();
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
        "h-full animate-pulse bg-card border border-border",
        className
      )}>
        <div className="h-full w-full px-4 py-6 flex flex-col items-center justify-center">
          <div className="h-8 w-8 mb-2 bg-muted rounded-sm" />
          <div className="h-5 w-20 bg-muted rounded-sm" />
        </div>
      </div>
    );
  }
  
  // Map color string to actual color values
  const colorMap: Record<string, { 
    darkBg: string, 
    darkHover: string,
    lightBg: string,
    lightHover: string
  }> = {
    'padeliga-teal': { 
      darkBg: 'bg-gradient-to-br from-[#1e4587] to-[#2a5cb8]', 
      darkHover: 'hover:from-[#1a3a77] hover:to-[#264fa3]',
      lightBg: 'bg-gradient-to-br from-[#3a7bd5] to-[#5294e0]',
      lightHover: 'hover:from-[#2f6aba] hover:to-[#4785d1]'
    },
    'padeliga-orange': { 
      darkBg: 'bg-gradient-to-br from-[#8c5615] to-[#b26c1d]', 
      darkHover: 'hover:from-[#7a4b12] hover:to-[#9b5f19]',
      lightBg: 'bg-gradient-to-br from-[#e08a23] to-[#f2a431]',
      lightHover: 'hover:from-[#cc801e] hover:to-[#dd962b]'
    },
    'padeliga-purple': { 
      darkBg: 'bg-gradient-to-br from-[#63289a] to-[#7b32c1]', 
      darkHover: 'hover:from-[#572387] hover:to-[#6c2cab]',
      lightBg: 'bg-gradient-to-br from-[#8c3dd8] to-[#9f50e0]',
      lightHover: 'hover:from-[#7d34c4] hover:to-[#8f46d0]'
    },
    'padeliga-green': { 
      darkBg: 'bg-gradient-to-br from-[#4c7420] to-[#619329]', 
      darkHover: 'hover:from-[#41651c] hover:to-[#548023]',
      lightBg: 'bg-gradient-to-br from-[#6fa32b] to-[#8bce35]',
      lightHover: 'hover:from-[#5f8c25] hover:to-[#7ab92e]'
    }
  };
  
  const colors = colorMap[color] || colorMap['padeliga-teal'];
  const bg = isDark ? colors.darkBg : colors.lightBg;
  const hover = isDark ? colors.darkHover : colors.lightHover;
  
  const ButtonContent = () => (
    <div 
      className={cn(
        "relative h-full overflow-hidden transition-all duration-200",
        bg,
        hover,
        className
      )}
      style={{ transform: 'skew(-4deg)' }}
      data-theme={currentTheme}
    >
      {/* Corner accent */}
      <div 
        className="absolute top-0 right-0 w-20 h-20 opacity-20"
        style={{ 
          transform: 'rotate(45deg) translate(40%, -40%)',
          background: `hsl(var(--${color}))` 
        }}
      />
      
      <div 
        className="h-full w-full px-4 py-6 flex flex-col items-center justify-center text-white"
        style={{ transform: 'skew(4deg)' }} // Counter-skew the content
      >
        <Icon className="h-8 w-8 mb-2" />
        <span className="text-base font-medium text-white text-center">{label}</span>
      </div>
    </div>
  );
  
  if (href) {
    return (
      <Link href={href} className="block h-full">
        <ButtonContent />
      </Link>
    );
  }
  
  return (
    <button 
      className="w-full h-full" 
      onClick={onClick}
      type="button"
    >
      <ButtonContent />
    </button>
  );
}

export default SkewedActionButton;