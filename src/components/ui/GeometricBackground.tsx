"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface GeometricBackgroundProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'intense';
  animated?: boolean;
}

export function GeometricBackground({
  className,
  variant = 'default',
  animated = true,
}: GeometricBackgroundProps) {
  const opacityLevels = {
    default: { base: 0.1, highlight: 0.15, low: 0.05, accent: 0.08 },
    subtle: { base: 0.05, highlight: 0.07, low: 0.03, accent: 0.04 },
    intense: { base: 0.2, highlight: 0.25, low: 0.15, accent: 0.18 },
  };
  
  const opacity = opacityLevels[variant];
  
  // Common animation CSS that will be used for all shapes
  const animationCSS = animated ? {
    animationDuration: '6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    animationFillMode: 'both',
  } : {};
  
  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      {/* Orange Shape */}
      <div
        className="shape-1"
        style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '256px',
          height: '256px',
          backgroundColor: 'hsl(var(--orange))',
          opacity: opacity.base,
          transform: 'rotate(15deg)',
          ...animationCSS,
          animationName: animated ? 'shapeFloat1' : 'none',
        }}
      />
      
      {/* Teal Rectangle */}
      <div
        className="shape-2"
        style={{
          position: 'absolute',
          top: '25%',
          right: '40px',
          width: '192px',
          height: '192px',
          backgroundColor: 'hsl(var(--teal))',
          opacity: opacity.highlight,
          transform: 'rotate(-12deg)',
          ...animationCSS,
          animationDelay: '0.7s',
          animationDuration: '7s',
          animationName: animated ? 'shapeFloat2' : 'none',
        }}
      />
      
      {/* Purple Parallelogram */}
      <div
        className="shape-3"
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '25%',
          width: '256px',
          height: '192px',
          backgroundColor: 'hsl(var(--purple))',
          opacity: opacity.base,
          transform: 'rotate(45deg)',
          ...animationCSS,
          animationDelay: '1.4s',
          animationDuration: '8s',
          animationName: animated ? 'shapeFloat3' : 'none',
        }}
      />
      
      {/* Green Shape */}
      <div
        className="shape-4"
        style={{
          position: 'absolute',
          top: '33%',
          left: '33%',
          width: '320px',
          height: '256px',
          backgroundColor: 'hsl(var(--green))',
          opacity: opacity.low,
          transform: 'skew(12deg) rotate(12deg)',
          ...animationCSS,
          animationDelay: '2.1s',
          animationDuration: '9s',
          animationName: animated ? 'shapeFloat4' : 'none',
        }}
      />
      
      {/* Red Shape */}
      <div
        className="shape-5"
        style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '192px',
          height: '192px',
          backgroundColor: 'hsl(var(--red))',
          opacity: opacity.base,
          transform: 'rotate(-15deg)',
          ...animationCSS,
          animationDelay: '2.8s',
          animationDuration: '7.5s',
          animationName: animated ? 'shapeFloat5' : 'none',
        }}
      />
      
      {/* Additional Teal Shape */}
      <div
        className="shape-6"
        style={{
          position: 'absolute',
          top: '66%',
          right: '25%',
          width: '128px',
          height: '128px',
          backgroundColor: 'hsl(var(--teal))',
          opacity: opacity.accent,
          transform: 'rotate(30deg)',
          ...animationCSS,
          animationDelay: '3.5s',
          animationDuration: '8.5s',
          animationName: animated ? 'shapeFloat2' : 'none',
        }}
      />
      
      {/* Additional Orange Shape */}
      <div
        className="shape-7"
        style={{
          position: 'absolute',
          top: '50%',
          left: '-40px',
          width: '160px',
          height: '160px',
          backgroundColor: 'hsl(var(--orange))',
          opacity: opacity.accent,
          transform: 'rotate(-10deg)',
          ...animationCSS,
          animationDelay: '1.8s',
          animationDuration: '7.8s',
          animationName: animated ? 'shapeFloat3' : 'none',
        }}
      />

      {/* Global CSS for animations */}
      <style global jsx>{`
        @keyframes shapeFloat1 {
          0%, 100% { transform: translateY(0) rotate(15deg); }
          50% { transform: translateY(-20px) rotate(15deg); }
        }
        
        @keyframes shapeFloat2 {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-25px) rotate(-12deg); }
        }
        
        @keyframes shapeFloat3 {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-15px) rotate(45deg); }
        }
        
        @keyframes shapeFloat4 {
          0%, 100% { transform: translateY(0) skew(12deg) rotate(12deg); }
          50% { transform: translateY(-18px) skew(12deg) rotate(12deg); }
        }
        
        @keyframes shapeFloat5 {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-22px) rotate(-15deg); }
        }
      `}</style>
    </div>
  );
}

export default GeometricBackground;