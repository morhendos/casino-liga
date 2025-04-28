"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Award, Smartphone, Save, CheckCircle, CheckCircle2, Star } from "lucide-react";
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

function PlayerProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState<PlayerProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Form state
  const [nickname, setNickname] = useState("");
  const [skillLevel, setSkillLevel] = useState("5");
  const [handedness, setHandedness] = useState("right");
  const [preferredPosition, setPreferredPosition] = useState("both");
  const [contactPhone, setContactPhone] = useState("");
  
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
    if (num < 4) return "text-padeliga-orange";
    if (num < 7) return "text-padeliga-teal";
    return "text-purple-500";
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
            size={16} 
            className={i < filledStars ? "fill-orange-400 text-orange-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
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
          {/* Left column with profile status card */}
          <div className="md:col-span-1">
            <Card className="relative overflow-hidden border-none shadow-lg">
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: `hsl(var(--purple))` }}
              />
              <div 
                className="absolute inset-0 -z-10 bg-card/95 backdrop-blur-sm dark:bg-card/90"
              />
              <CardHeader className="pb-4 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-padeliga-purple" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-padeliga-purple/10 mb-3 relative overflow-hidden">
                    <div className="text-padeliga-purple text-4xl font-bold">
                      {hasProfile ? nickname.charAt(0).toUpperCase() : (session?.user?.name || "P").charAt(0)}
                    </div>
                    {hasProfile && (
                      <div 
                        className="absolute bottom-0 right-0 w-6 h-6 bg-padeliga-green rounded-full flex items-center justify-center border-2 border-white"
                      >
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-xl">
                    {hasProfile ? nickname : session?.user?.name || "Player"}
                  </h3>
                  {hasProfile ? (
                    <Badge className="mt-2 bg-padeliga-green rounded-full font-normal">
                      Profile Complete
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 text-padeliga-red border-padeliga-red">
                      Incomplete
                    </Badge>
                  )}
                </div>
                
                {hasProfile && (
                  <div className="space-y-6 mt-6">
                    {/* Skill Level - Improved layout */}
                    <div className="rounded-lg bg-gray-900 p-4 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 mr-2 text-amber-400" />
                          <span className="text-white font-medium">Skill Level</span>
                        </div>
                        <span className={`text-lg font-medium text-purple-400`}>
                          {getSkillLevelText(skillLevel)}
                        </span>
                      </div>
                      <div className="pt-1">
                        {getSkillLevelStars(skillLevel)}
                      </div>
                    </div>
                    
                    {/* Handedness - Improved layout */}
                    <div className="rounded-lg bg-gray-900 p-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <HandIcon />
                          <span className="text-white font-medium ml-2">Handedness</span>
                        </div>
                        <span className="text-blue-400 font-medium">
                          {handedness === "right" ? "Right-handed" : 
                           handedness === "left" ? "Left-handed" : "Ambidextrous"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Position - Improved layout */}
                    <div className="rounded-lg bg-gray-900 p-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PositionIcon />
                          <span className="text-white font-medium ml-2">Position</span>
                        </div>
                        <span className="text-blue-400 font-medium capitalize">
                          {preferredPosition}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {hasProfile && (
                <div className="px-6 pb-6">
                  <SkewedActionButton
                    label="View Stats"
                    icon={Award}
                    color="padeliga-purple"
                    onClick={() => toast.info("Player stats coming soon!")}
                  />
                </div>
              )}
            </Card>
            
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
          
          {/* Right column with form */}
          <div className="md:col-span-2">
            <Card className="relative overflow-hidden border-none shadow-lg">
              {/* Left accent border */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: `hsl(var(--teal))` }}
              />
              
              {/* Background with blur */}
              <div 
                className="absolute inset-0 -z-10 bg-card/95 backdrop-blur-sm dark:bg-card/90"
              />
              
              {/* Success indicator that slides in when save is successful */}
              <div 
                className={cn(
                  "absolute right-4 top-4 flex items-center transition-all duration-300 ease-in-out bg-padeliga-green/10 py-1 px-3 rounded-full",
                  saveSuccess ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                )}
              >
                <CheckCircle className="text-padeliga-green mr-2" size={16} />
                <span className="text-sm text-padeliga-green">Saved successfully</span>
              </div>
              
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-5 w-5 text-padeliga-teal" />
                  <CardTitle>{hasProfile ? "Edit Your Profile" : "Create Your Player Profile"}</CardTitle>
                </div>
                <CardDescription>
                  Fill in your padel player details to help teammates and opponents know more about you.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <Label htmlFor="nickname" className="flex items-center text-base mb-2">
                      <User className="h-4 w-4 mr-2 text-padeliga-teal" />
                      Nickname
                      <span className="text-padeliga-red ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="nickname"
                        placeholder="Your padel nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        className="border-input/50 focus:border-padeliga-teal pl-4"
                      />
                      {nickname && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-padeliga-green" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is how you'll be known to other players in the league.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="skillLevel" className="flex items-center text-base mb-2">
                        <Star className="h-4 w-4 mr-2 text-padeliga-teal" />
                        Skill Level
                        <span className="text-padeliga-red ml-1">*</span>
                      </Label>
                      <Select
                        value={skillLevel}
                        onValueChange={setSkillLevel}
                      >
                        <SelectTrigger id="skillLevel" className="border-input/50 focus:border-padeliga-teal">
                          <SelectValue placeholder="Select your skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              {level} - {level < 4 ? "Beginner" : level < 7 ? "Intermediate" : "Advanced"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Beginner</span>
                        <span className="text-xs text-muted-foreground">Advanced</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="handedness" className="flex items-center text-base mb-2">
                        <HandIcon />
                        <span className="ml-2">Handedness</span>
                        <span className="text-padeliga-red ml-1">*</span>
                      </Label>
                      <Select
                        value={handedness}
                        onValueChange={setHandedness}
                      >
                        <SelectTrigger id="handedness" className="border-input/50 focus:border-padeliga-teal">
                          <SelectValue placeholder="Select your handedness" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="right">Right-handed</SelectItem>
                          <SelectItem value="left">Left-handed</SelectItem>
                          <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="preferredPosition" className="flex items-center text-base mb-2">
                        <PositionIcon />
                        <span className="ml-2">Preferred Position</span>
                        <span className="text-padeliga-red ml-1">*</span>
                      </Label>
                      <Select
                        value={preferredPosition}
                        onValueChange={setPreferredPosition}
                      >
                        <SelectTrigger id="preferredPosition" className="border-input/50 focus:border-padeliga-teal">
                          <SelectValue placeholder="Select your preferred position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="forehand">Forehand (Right)</SelectItem>
                          <SelectItem value="backhand">Backhand (Left)</SelectItem>
                          <SelectItem value="both">Both Positions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="contactPhone" className="flex items-center text-base mb-2">
                        <Smartphone className="h-4 w-4 mr-2 text-padeliga-teal" />
                        Contact Phone
                      </Label>
                      <Input
                        id="contactPhone"
                        placeholder="Your phone number (optional)"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="border-input/50 focus:border-padeliga-teal"
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-center py-8 border-t">
                  <SkewedButton
                    type="submit"
                    buttonVariant="outline"
                    buttonSize="lg"
                    hoverEffectColor="teal"
                    hoverEffectVariant="outline"
                    className="border-2 border-padeliga-teal text-padeliga-teal hover:bg-padeliga-teal/10 min-w-[200px] relative"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⟳</span> 
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center font-medium tracking-wide">
                        <Save className="h-4 w-4 mr-2" />
                        {hasProfile ? "Update Profile" : "Create Profile"}
                      </span>
                    )}
                  </SkewedButton>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(PlayerProfilePage);
