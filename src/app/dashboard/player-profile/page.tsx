"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Award, Smartphone, Save, CheckCircle, CheckCircle2, Star, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SkewedActionButton } from "@/components/dashboard/SkewedActionButton";
import { SkewedButton } from "@/components/ui/SkewedButton";

// Define interface for player data
interface PlayerProfile {
  id?: string;
  _id?: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  contactPhone?: string;
}

// Custom icon for handedness
const HandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-400"
  >
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.5-5.5-1.5L3 17.5" />
  </svg>
);

// Custom icon for position
const PositionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-400"
  >
    <circle cx="12" cy="5" r="3" />
    <path d="M12 8v3" />
    <path d="m9 11 1.5 1.5" />
    <path d="M12 11c-1.7 1-3 3.4-3 5.5 0 1.7.9 2.5 2 2.5s2 .8 2 2.5c0 2.1-1.3 4.5-3 5.5" />
    <path d="m15 11-1.5 1.5" />
  </svg>
);

// Award badge icon
const AwardBadgeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

// Stats icon
const StatsIcon = () => (
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
);

function PlayerProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [nickname, setNickname] = useState("");
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [skillLevel, setSkillLevel] = useState("5");
  const [handedness, setHandedness] = useState("right");
  const [preferredPosition, setPreferredPosition] = useState("both");
  const [contactPhone, setContactPhone] = useState("");

  // Validation states
  const isNicknameValid = nickname.length >= 2;
  
  // Fetch player profile data
  useEffect(() => {
    async function fetchPlayerProfile() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/players?userId=${session.user.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Failed to fetch player profile");
        }
        
        const data = await response.json();
        
        if (data.players && data.players.length > 0) {
          const player = data.players[0];
          setPlayerData(player);
          setHasProfile(true);
          
          // Fill form data
          setNickname(player.nickname || "");
          setSkillLevel(player.skillLevel?.toString() || "5");
          setHandedness(player.handedness || "right");
          setPreferredPosition(player.preferredPosition || "both");
          setContactPhone(player.contactPhone || "");
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error("Error fetching player profile:", error);
        toast.error("Failed to load player profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlayerProfile();
  }, [session]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setNicknameTouched(true);
    
    // Validate form before submission
    if (!isNicknameValid) {
      toast.error("Please enter a valid nickname (at least 2 characters)");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formData: PlayerProfile = {
        nickname,
        skillLevel: parseInt(skillLevel),
        handedness,
        preferredPosition,
        contactPhone
      };
      
      // Use either id or _id, whichever is available
      const playerId = playerData?.id || playerData?._id;
      
      let response;
      
      if (hasProfile && playerId) {
        // Update existing profile
        response = await fetch(`/api/players/${playerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new profile
        response = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }
      
      const result = await response.json();
      setPlayerData(result);
      setHasProfile(true);
      setSaveSuccess(true);
      
      toast.success(hasProfile ? "Player profile updated" : "Player profile created");
    } catch (error) {
      console.error("Error saving player profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save player profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get skill level text
  const getSkillLevelText = (level: string) => {
    const num = parseInt(level);
    if (num < 4) return "Beginner";
    if (num < 7) return "Intermediate";
    return "Advanced";
  };

  // Get skill level color
  const getSkillLevelColor = (level: string) => {
    const num = parseInt(level);
    if (num < 4) return "from-orange-600 to-amber-500";
    if (num < 7) return "from-teal-600 to-blue-500";
    return "from-purple-600 to-fuchsia-500";
  };
  
  // Get skill level color for text
  const getSkillLevelTextColor = (level: string) => {
    const num = parseInt(level);
    if (num < 4) return "text-amber-400";
    if (num < 7) return "text-teal-400";
    return "text-purple-400";
  };
  
  // Get skill level stars
  const getSkillLevelStars = (level: string) => {
    const num = parseInt(level);
    const maxStars = 5;
    const filledStars = Math.round((num / 10) * maxStars);
    
    return (
      <div className="flex items-center gap-1">
        {Array(maxStars).fill(0).map((_, i) => (
          <Star 
            key={i} 
            size={18} 
            className={i < filledStars ? "fill-amber-400 text-amber-400" : "text-gray-700"} 
          />
        ))}
      </div>
    );
  };

  // Map handedness to display text
  const getHandednessDisplay = (hand: string) => {
    switch (hand) {
      case 'right': return 'Right-handed';
      case 'left': return 'Left-handed';
      default: return 'Ambidextrous';
    }
  };

  // Map position to display text
  const getPositionDisplay = (position: string) => {
    switch (position) {
      case 'forehand': return 'Forehand';
      case 'backhand': return 'Backhand';
      default: return 'Both Positions';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Geometric background elements */}
        <div className="fixed inset-0 -z-10 opacity-5 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-padeliga-purple rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-12 w-72 h-72 bg-padeliga-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-padeliga-orange rounded-full blur-3xl"></div>
        </div>
        
        {/* Header with skewed background */}
        <div className="relative mb-8 overflow-hidden rounded-md">
          <div 
            className="absolute inset-0 -z-10 bg-gradient-to-r from-padeliga-purple to-padeliga-teal opacity-20"
            style={{ transform: 'skew(-4deg) scale(1.1)' }}
          />
          <div className="py-8 px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-padeliga-purple/20 flex items-center justify-center">
                <User className="h-5 w-5 text-padeliga-purple" />
              </div>
              <h1 className="text-3xl font-bold heading-accent">Player Profile</h1>
            </div>
            <p className="text-muted-foreground ml-14">
              Complete your profile to improve matchmaking and help others know your playing style.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column with profile status card - ENHANCED VERSION */}
          <div className="md:col-span-1">
            {/* Enhanced Profile Status Card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-padeliga-teal"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-padeliga-purple/10 blur-xl"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-padeliga-teal/10 blur-xl"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3 mb-5">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-padeliga-purple/20">
                    <User className="h-5 w-5 text-padeliga-purple" />
                  </div>
                  <h3 className="font-semibold text-gray-100">Profile Status</h3>
                </div>
                
                {/* Avatar with glowing effect and integrated badge */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {/* Pulsing background glow */}
                    <div className="absolute inset-0 rounded-full bg-padeliga-purple/40 blur-md animate-pulse"></div>
                    
                    {/* Avatar circle with 3D appearance */}
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-padeliga-purple/40 shadow-lg">
                      {/* Subtle inner highlight */}
                      <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-gray-700/20 to-transparent"></div>
                      
                      {/* Letter */}
                      <div className="relative text-padeliga-purple text-5xl font-bold drop-shadow-md">
                        {hasProfile ? nickname.charAt(0).toUpperCase() : (session?.user?.name || "P").charAt(0)}
                      </div>
                    </div>
                    
                    {/* Positioned badge with improved styling */}
                    {hasProfile && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="flex items-center bg-gradient-to-r from-padeliga-purple to-padeliga-purple/80 text-white font-medium px-3 py-1.5 text-sm rounded-full border border-padeliga-purple/90 shadow-lg">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
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
                      {/* Additional player information - can be conditionally rendered */}
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
                            className="mr-1.5 text-padeliga-purple/70"
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
                            className="mr-1.5 text-padeliga-teal/70"
                          >
                            <rect width="8" height="14" x="8" y="5" rx="1"></rect>
                            <path d="m4 9 4-4v6"></path>
                            <path d="m4 15 4 4v-6"></path>
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
                            className="mr-1.5 text-padeliga-orange/70"
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
                            className="mr-1.5 text-padeliga-green/70"
                          >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                          <span>0 matches</span>
                        </div>
                      </div>

                      {/* Skill level visual representation */}
                      <div className="mt-6 w-full">
                        <div className="relative overflow-hidden rounded-lg bg-gray-800/50 p-4">
                          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getSkillLevelColor(skillLevel)}`}></div>
                          
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 mr-2">
                                <Star className="h-4 w-4 text-amber-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-300">Skill Level</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-md bg-gray-800 ${getSkillLevelTextColor(skillLevel)} text-xs font-semibold`}>
                              {getSkillLevelText(skillLevel)}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-gray-400 text-xs">1</div>
                            <div className="w-full mx-2 my-1">
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full bg-gradient-to-r ${getSkillLevelColor(skillLevel)}`} 
                                  style={{ width: `${parseInt(skillLevel) * 10}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-gray-400 text-xs">10</div>
                          </div>
                          
                          {getSkillLevelStars(skillLevel)}
                        </div>
                      </div>
                      
                      {/* View Stats Button - with hover effect */}
                      <button 
                        onClick={() => toast.info("Player stats coming soon!")}
                        className="w-full mt-6 py-2 px-4 rounded-md bg-gray-800/70 hover:bg-gray-800 transition-colors group flex items-center justify-center space-x-2"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                          <StatsIcon />
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
            
            {/* Player benefits card */}
            {!hasProfile && (
              <Card className="mt-4 border-none shadow-lg relative overflow-hidden">
                <div 
                  className="absolute inset-0 -z-10 bg-card/95 backdrop-blur-sm dark:bg-card/90"
                />
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center">
                    <Award className="h-4 w-4 mr-2 text-padeliga-orange" />
                    Why Create a Profile?
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-padeliga-green mt-0.5 shrink-0" />
                      <span>Join leagues and tournaments</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-padeliga-green mt-0.5 shrink-0" />
                      <span>Find compatible teammates</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-padeliga-green mt-0.5 shrink-0" />
                      <span>Track your match history and statistics</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-padeliga-green mt-0.5 shrink-0" />
                      <span>Improve your game with performance insights</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right column with ENHANCED form */}
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl h-full">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-teal to-padeliga-blue"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-padeliga-teal/10 blur-xl"></div>
              <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-padeliga-blue/10 blur-xl"></div>
              
              {/* Success indicator that slides in when save is successful */}
              <div 
                className={cn(
                  "absolute right-4 top-4 z-10 flex items-center transition-all duration-300 ease-in-out bg-padeliga-green/10 py-1.5 px-4 rounded-full",
                  saveSuccess ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                )}
              >
                <CheckCircle className="text-padeliga-green mr-2" size={18} />
                <span className="text-sm text-padeliga-green font-medium">Saved successfully</span>
              </div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center bg-padeliga-teal/20 relative">
                      <Award className="h-5 w-5 text-padeliga-teal" />
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-padeliga-teal/20 rounded-full blur-md animate-pulse-slow"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {hasProfile ? "Edit Your Profile" : "Create Your Player Profile"}
                      </h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Fill in your padel player details to help teammates and opponents know more about you.
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%-100px)]">
                  <div className="space-y-8 flex-grow">
                    {/* Nickname Field - Enhanced */}
                    <div className="relative">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-teal/10 mr-2">
                          <User className="h-4 w-4 text-padeliga-teal" />
                        </div>
                        <label htmlFor="nickname" className="text-lg font-medium text-white">
                          Nickname <span className="text-red-500">*</span>
                        </label>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
                        <div className="relative">
                          <Input
                            id="nickname"
                            placeholder="Your padel nickname"
                            value={nickname}
                            onChange={(e) => {
                              setNickname(e.target.value);
                              setNicknameTouched(true);
                            }}
                            required
                            className={cn(
                              "pl-4 py-6 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-teal transition-all duration-300",
                              "placeholder:text-gray-500 font-medium",
                              nickname && isNicknameValid && "border-padeliga-green/50 focus:border-padeliga-green",
                              nicknameTouched && !isNicknameValid && "border-red-500/70 focus:border-red-500"
                            )}
                          />
                          
                          {/* Validation icon */}
                          {nicknameTouched && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {isNicknameValid ? (
                                <div className="bg-padeliga-green/10 p-1 rounded-full">
                                  <CheckCircle className="h-5 w-5 text-padeliga-green" />
                                </div>
                              ) : (
                                <div className="bg-red-500/10 p-1 rounded-full">
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mt-2 ml-10">
                        This is how you'll be known to other players in the league.
                      </p>
                      
                      {/* Validation message */}
                      {nicknameTouched && !isNicknameValid && (
                        <p className="text-sm text-red-500 mt-1 ml-10 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Nickname must be at least 2 characters
                        </p>
                      )}
                    </div>
                    
                    {/* Two columns layout for skill level and handedness */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skill Level - Enhanced */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/10 mr-2">
                            <Star className="h-4 w-4 text-amber-400" />
                          </div>
                          <label htmlFor="skillLevel" className="text-lg font-medium text-white">
                            Skill Level <span className="text-red-500">*</span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={skillLevel}
                            onValueChange={setSkillLevel}
                          >
                            <SelectTrigger 
                              id="skillLevel" 
                              className="py-6 bg-gray-800/70 border-gray-700 focus:border-amber-500 text-base"
                            >
                              <div className="flex items-center">
                                <span className="text-lg font-medium mr-2">{skillLevel}</span>
                                <span className="text-sm text-gray-400">- {getSkillLevelText(skillLevel)}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                                <SelectItem key={level} value={level.toString()} className="text-base">
                                  <div className="flex items-center">
                                    <span className="text-lg font-medium mr-2">{level}</span>
                                    <span className="text-sm text-gray-400">- {level < 4 ? "Beginner" : level < 7 ? "Intermediate" : "Advanced"}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between px-1">
                          <span className="text-xs text-gray-500">Beginner</span>
                          <div className="w-full mx-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getSkillLevelColor(skillLevel)}`} 
                              style={{ width: `${parseInt(skillLevel) * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">Advanced</span>
                        </div>
                      </div>
                      
                      {/* Handedness - Enhanced */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/10 mr-2">
                            <HandIcon />
                          </div>
                          <label htmlFor="handedness" className="text-lg font-medium text-white">
                            Handedness <span className="text-red-500">*</span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={handedness}
                            onValueChange={setHandedness}
                          >
                            <SelectTrigger 
                              id="handedness" 
                              className="py-6 bg-gray-800/70 border-gray-700 focus:border-blue-400 text-base"
                            >
                              <div className="flex items-center">
                                <span className="font-medium">{getHandednessDisplay(handedness)}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="right" className="text-base">Right-handed</SelectItem>
                              <SelectItem value="left" className="text-base">Left-handed</SelectItem>
                              <SelectItem value="ambidextrous" className="text-base">Ambidextrous</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-center mt-2">
                          <div 
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium", 
                              handedness === "right" ? "bg-blue-500/20 text-blue-400" : 
                              handedness === "left" ? "bg-green-500/20 text-green-400" : 
                              "bg-purple-500/20 text-purple-400"
                            )}
                          >
                            {handedness === "right" ? "Primary hand: Right" : 
                             handedness === "left" ? "Primary hand: Left" : 
                             "Uses both hands equally"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Two columns layout for position and contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Preferred Position - Enhanced */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-500/10 mr-2">
                            <PositionIcon />
                          </div>
                          <label htmlFor="preferredPosition" className="text-lg font-medium text-white">
                            Preferred Position <span className="text-red-500">*</span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={preferredPosition}
                            onValueChange={setPreferredPosition}
                          >
                            <SelectTrigger 
                              id="preferredPosition" 
                              className="py-6 bg-gray-800/70 border-gray-700 focus:border-orange-400 text-base"
                            >
                              <div className="flex items-center font-medium">
                                {getPositionDisplay(preferredPosition)}
                                {preferredPosition === "forehand" && " (Right)"}
                                {preferredPosition === "backhand" && " (Left)"}
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="forehand" className="text-base">Forehand (Right)</SelectItem>
                              <SelectItem value="backhand" className="text-base">Backhand (Left)</SelectItem>
                              <SelectItem value="both" className="text-base">Both Positions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-center mt-2">
                          <div 
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium", 
                              preferredPosition === "forehand" ? "bg-orange-500/20 text-orange-400" : 
                              preferredPosition === "backhand" ? "bg-green-500/20 text-green-400" : 
                              "bg-purple-500/20 text-purple-400"
                            )}
                          >
                            {preferredPosition === "forehand" ? "Right side of court" : 
                             preferredPosition === "backhand" ? "Left side of court" : 
                             "Comfortable on both sides"}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Phone - Enhanced */}
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-teal/10 mr-2">
                            <Smartphone className="h-4 w-4 text-padeliga-teal" />
                          </div>
                          <label htmlFor="contactPhone" className="text-lg font-medium text-white">
                            Contact Phone <span className="text-gray-500 text-sm">(optional)</span>
                          </label>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Input
                            id="contactPhone"
                            placeholder="Your phone number (optional)"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="pl-4 py-6 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-teal transition-all duration-300 placeholder:text-gray-500"
                          />
                        </div>
                        
                        <p className="text-sm text-gray-400 mt-2">
                          Used only for league communications. Never shared publicly.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button Section - Enhanced */}
                  <div className="mt-10 pt-6 border-t border-gray-800/50">
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "relative overflow-hidden group px-8 py-4 min-w-[200px]",
                          "bg-gradient-to-r from-padeliga-teal to-padeliga-blue rounded-md",
                          "shadow-lg shadow-padeliga-teal/20",
                          "transform transition-all duration-300",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        )}
                      >
                        {/* Background effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        
                        {/* Shine effect */}
                        <div 
                          className="absolute -inset-full top-0 block w-1/2 h-full z-5 transform -skew-x-20 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"
                        ></div>
                        
                        {/* Button content */}
                        <div className="relative z-10 flex items-center justify-center">
                          {isLoading ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-white font-semibold">Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Save className="h-5 w-5 mr-2 text-white" />
                              <span className="text-white font-semibold">
                                {hasProfile ? "Update Profile" : "Create Profile"}
                              </span>
                              <ChevronRight className="h-5 w-5 ml-1 text-white/80 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PlayerProfilePage);