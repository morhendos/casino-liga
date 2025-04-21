/**
 * Share League Button component
 * For including in the admin dashboard to easily share league links
 */

'use client';

import { useState } from 'react';
import { LinkIcon, CheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

interface ShareLeagueButtonProps {
  leagueId: string;
  isPublic?: boolean;
}

export default function ShareLeagueButton({ leagueId, isPublic = true }: ShareLeagueButtonProps) {
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
      <Button 
        variant={copied ? "success" : "outline"} 
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
        disabled={!isPublic}
      >
        {copied ? (
          <>
            <CheckIcon size={16} />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon size={16} />
            Share League
          </>
        )}
      </Button>
      
      {!isPublic && showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-500 text-white text-xs rounded shadow-lg whitespace-nowrap">
          League must be public to share
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
    </div>
  );
}
