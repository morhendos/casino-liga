/**
 * Share League Button component
 * For including in the admin dashboard to easily share league links
 */

'use client';

import { useState } from 'react';
import { Share2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShareLeagueButtonProps {
  leagueId: string;
  isPublic?: boolean;
}

export function ShareLeagueButton({ leagueId, isPublic = true }: ShareLeagueButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Generate the public league URL
  const getLeagueUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/leagues/${leagueId}`;
  };
  
  // Handle copy to clipboard
  const copyToClipboard = async () => {
    if (!isPublic) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }
    
    try {
      const url = getLeagueUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={copyToClipboard}
        disabled={!isPublic}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-opacity-50",
          copied 
            ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-md shadow-emerald-600/20" 
            : isPublic
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white shadow-md hover:shadow-lg shadow-pink-600/10 hover:shadow-pink-600/20" 
              : "bg-gray-800 text-gray-400 cursor-not-allowed opacity-70"
        )}
      >
        {copied ? (
          <>
            <CheckCircle size={14} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 size={14} />
            <span>Share</span>
          </>
        )}
      </button>
      
      {!isPublic && showTooltip && (
        <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50 flex items-center">
          <AlertCircle size={12} className="mr-1" />
          League must be public to share
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-rose-500"></div>
        </div>
      )}
    </div>
  );
}

// Add this line for backwards compatibility with any direct default imports
export default ShareLeagueButton;