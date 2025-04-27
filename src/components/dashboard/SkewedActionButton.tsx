"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  // Map color string to actual color values
  const colorMap: Record<string, { bg: string, hover: string }> = {
    'padeliga-teal': { 
      bg: 'bg-gradient-to-br from-[#1e4587] to-[#2a5cb8]', 
      hover: 'hover:from-[#1a3a77] hover:to-[#264fa3]'
    },
    'padeliga-orange': { 
      bg: 'bg-gradient-to-br from-[#8c5615] to-[#b26c1d]', 
      hover: 'hover:from-[#7a4b12] hover:to-[#9b5f19]'
    },
    'padeliga-purple': { 
      bg: 'bg-gradient-to-br from-[#63289a] to-[#7b32c1]', 
      hover: 'hover:from-[#572387] hover:to-[#6c2cab]'
    },
    'padeliga-green': { 
      bg: 'bg-gradient-to-br from-[#4c7420] to-[#619329]', 
      hover: 'hover:from-[#41651c] hover:to-[#548023]'
    }
  };
  
  const colors = colorMap[color] || colorMap['padeliga-teal'];
  
  const ButtonContent = () => (
    <div 
      className={cn(
        "relative h-full overflow-hidden transition-all duration-200",
        colors.bg,
        className
      )}
      style={{ transform: 'skew(-4deg)' }}
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
