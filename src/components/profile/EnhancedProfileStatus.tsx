"use client";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ProfileStatusProps {
  nickname: string;
  hasProfile: boolean;
  skillLevel: string;
  handedness: string;
  preferredPosition: string;
}

// Helper functions
const getHandednessDisplay = (hand: string) => {
  switch (hand) {
    case 'right': return 'Right-handed';
    case 'left': return 'Left-handed';
    default: return 'Ambidextrous';
  }
};

const getPositionDisplay = (position: string) => {
  switch (position) {
    case 'forehand': return 'Forehand';
    case 'backhand': return 'Backhand';
    default: return 'Both Positions';
  }
};

export default function EnhancedProfileStatus({ 
  nickname, 
  hasProfile, 
  skillLevel, 
  handedness, 
  preferredPosition 
}: ProfileStatusProps) {
  const { data: session } = useSession();
  const initialLetter = hasProfile 
    ? nickname.charAt(0).toUpperCase() 
    : (session?.user?.name || "P").charAt(0);
  
  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-teal-500"></div>
      
      {/* Decorative background elements */}
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-600/10 blur-xl"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-teal-500/10 blur-xl"></div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3 mb-5">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-purple-600/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-500"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h3 className="font-semibold text-gray-100">Profile Status</h3>
        </div>
        
        {/* Avatar with glowing effect and integrated badge */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Pulsing background glow */}
            <div className="absolute inset-0 rounded-full bg-purple-600/40 blur-md animate-pulse"></div>
            
            {/* Avatar circle with 3D appearance */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-600/40 shadow-lg">
              {/* Subtle inner highlight */}
              <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-gray-700/20 to-transparent"></div>
              
              {/* Letter */}
              <div className="relative text-purple-500 text-5xl font-bold drop-shadow-md">
                {initialLetter}
              </div>
            </div>
            
            {/* Positioned badge with improved styling */}
            {hasProfile && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center bg-gradient-to-r from-purple-600 to-purple-500/80 text-white font-medium px-3 py-1.5 text-sm rounded-full border border-purple-600/90 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  Complete
                </div>
              </div>
            )}
          </div>
          
          {/* Name with better typography and subtle highlight */}
          <h3 className="font-medium text-xl mt-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {hasProfile ? nickname : session?.user?.name || "Player"}
          </h3>
          
          {hasProfile && (
            <>
              {/* Player stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                <div className="flex items-center text-sm text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1.5 text-purple-500/70"
                  >
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                  </svg>
                  <span>Level {skillLevel}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1.5 text-teal-500/70"
                  >
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.5-5.5-1.5L3 17.5"></path>
                  </svg>
                  <span>{getHandednessDisplay(handedness).split('-')[0]}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1.5 text-orange-500/70"
                  >
                    <circle cx="12" cy="5" r="3"></circle>
                    <path d="M12 8v3"></path>
                    <path d="m9 11 1.5 1.5"></path>
                    <path d="M12 11c-1.7 1-3 3.4-3 5.5 0 1.7.9 2.5 2 2.5s2 .8 2 2.5c0 2.1-1.3 4.5-3 5.5"></path>
                    <path d="m15 11-1.5 1.5"></path>
                  </svg>
                  <span>{getPositionDisplay(preferredPosition)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mr-1.5 text-green-500/70"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span>0 matches</span>
                </div>
              </div>
              
              {/* View Stats Button - with hover effect */}
              <button 
                onClick={() => toast.info("Player stats coming soon!")}
                className="w-full mt-6 py-2 px-4 rounded-md bg-gray-800/70 hover:bg-gray-800 transition-colors group flex items-center justify-center space-x-2"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-white"
                  >
                    <path d="M12 20v-6"></path>
                    <path d="M6 20V10"></path>
                    <path d="M18 20V4"></path>
                  </svg>
                </div>
                <span className="text-purple-300 text-sm font-medium group-hover:text-purple-200 transition-colors">
                  View detailed stats
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}