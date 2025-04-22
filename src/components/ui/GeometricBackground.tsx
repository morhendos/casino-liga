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
  const opacityMap = {
    default: {
      shape1: 'opacity-10',
      shape2: 'opacity-15',
      shape3: 'opacity-10',
      shape4: 'opacity-5',
      shape5: 'opacity-8',
    },
    subtle: {
      shape1: 'opacity-5',
      shape2: 'opacity-5',
      shape3: 'opacity-5',
      shape4: 'opacity-3',
      shape5: 'opacity-4',
    },
    intense: {
      shape1: 'opacity-20',
      shape2: 'opacity-25',
      shape3: 'opacity-20',
      shape4: 'opacity-15',
      shape5: 'opacity-18',
    },
  };

  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      {/* Orange Shape */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '256px',
          height: '256px',
          transform: 'rotate(15deg)',
          backgroundColor: 'hsl(var(--orange))',
          opacity: variant === 'default' ? 0.1 : variant === 'subtle' ? 0.05 : 0.2,
          animation: animated ? 'floatShape1 8s ease-in-out infinite' : 'none'
        }}
      />
      
      {/* Teal Rectangle */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          right: '40px',
          width: '192px',
          height: '192px',
          transform: 'rotate(-12deg)',
          backgroundColor: 'hsl(var(--teal))',
          opacity: variant === 'default' ? 0.15 : variant === 'subtle' ? 0.05 : 0.25,
          animation: animated ? 'floatShape2 9s ease-in-out 1s infinite' : 'none'
        }}
      />
      
      {/* Purple Parallelogram */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '25%',
          width: '256px',
          height: '192px',
          transform: 'rotate(45deg)',
          backgroundColor: 'hsl(var(--purple))',
          opacity: variant === 'default' ? 0.1 : variant === 'subtle' ? 0.05 : 0.2,
          animation: animated ? 'floatShape3 10s ease-in-out 2s infinite' : 'none'
        }}
      />
      
      {/* Green Shape */}
      <div
        style={{
          position: 'absolute',
          top: '33%',
          left: '33%',
          width: '320px',
          height: '256px',
          transform: 'skew(12deg) rotate(12deg)',
          backgroundColor: 'hsl(var(--green))',
          opacity: variant === 'default' ? 0.05 : variant === 'subtle' ? 0.03 : 0.15,
          animation: animated ? 'floatShape4 11s ease-in-out 3s infinite' : 'none'
        }}
      />
      
      {/* Red Shape */}
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '192px',
          height: '192px',
          transform: 'rotate(-15deg)',
          backgroundColor: 'hsl(var(--red))',
          opacity: variant === 'default' ? 0.1 : variant === 'subtle' ? 0.05 : 0.2,
          animation: animated ? 'floatShape5 12s ease-in-out 4s infinite' : 'none'
        }}
      />
      
      {/* Additional Teal Shape */}
      <div
        style={{
          position: 'absolute',
          top: '66%',
          right: '25%',
          width: '128px',
          height: '128px',
          transform: 'rotate(30deg)',
          backgroundColor: 'hsl(var(--teal))',
          opacity: variant === 'default' ? 0.08 : variant === 'subtle' ? 0.04 : 0.18,
          animation: animated ? 'floatShape1 9s ease-in-out 2s infinite' : 'none'
        }}
      />
      
      {/* Additional Orange Shape */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '-40px',
          width: '160px',
          height: '160px',
          transform: 'rotate(-10deg)',
          backgroundColor: 'hsl(var(--orange))',
          opacity: variant === 'default' ? 0.08 : variant === 'subtle' ? 0.04 : 0.18,
          animation: animated ? 'floatShape3 10s ease-in-out 3s infinite' : 'none'
        }}
      />

      {/* Add this style element to define the animations */}
      <style jsx>{`
        @keyframes floatShape1 {
          0%, 100% { transform: translateY(0) rotate(15deg); }
          50% { transform: translateY(-10px) rotate(15deg); }
        }
        
        @keyframes floatShape2 {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-12deg); }
        }
        
        @keyframes floatShape3 {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-12px) rotate(45deg); }
        }
        
        @keyframes floatShape4 {
          0%, 100% { transform: translateY(0) skew(12deg) rotate(12deg); }
          50% { transform: translateY(-8px) skew(12deg) rotate(12deg); }
        }
        
        @keyframes floatShape5 {
          0%, 100% { transform: translateY(0) rotate(-15deg); }
          50% { transform: translateY(-10px) rotate(-15deg); }
        }
      `}</style>
    </div>
  );
}

export default GeometricBackground;