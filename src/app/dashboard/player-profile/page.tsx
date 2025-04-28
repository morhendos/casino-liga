"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Award, Smartphone, MessageSquare, Save, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SkewedActionButton } from "@/components/dashboard/SkewedActionButton";

// Define interface for player data
interface PlayerProfile {
  id?: string;
  _id?: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  contactPhone?: string;
  bio?: string;
}

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
  const [bio, setBio] = useState("");
  
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
          setBio(player.bio || "");
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
        contactPhone,
        bio
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with skewed background */}
        <div className="relative mb-8 overflow-hidden">
          <div 
            className="absolute inset-0 -z-10 bg-gradient-to-r from-padeliga-purple to-padeliga-teal opacity-10"
            style={{ transform: 'skew(-4deg) scale(1.1)' }}
          />
          <div className="py-6 px-8">
            <h1 className="text-3xl font-bold mb-2 heading-accent">Player Profile</h1>
            <p className="text-muted-foreground">
              Complete your profile to improve matchmaking and help others know your playing style.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column with profile status card */}
          <div className="md:col-span-1">
            <Card className="relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: `hsl(var(--purple))` }}
              />
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-4 border-b">
                <CardTitle>Profile Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-sm flex items-center justify-center bg-padeliga-purple/10 mr-3">
                    <User className="h-6 w-6 text-padeliga-purple" />
                  </div>
                  <div>
                    <h3 className="font-medium">{session?.user?.name || "Player"}</h3>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Status</span>
                    {hasProfile ? (
                      <Badge variant="outline" className="text-padeliga-green border-padeliga-green">
                        Complete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-padeliga-red border-padeliga-red">
                        Incomplete
                      </Badge>
                    )}
                  </div>
                  
                  {hasProfile && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Skill Level</span>
                        <span className="text-sm font-medium">{getSkillLevelText(skillLevel)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Handedness</span>
                        <span className="text-sm font-medium capitalize">{handedness}-handed</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Position</span>
                        <span className="text-sm font-medium capitalize">{preferredPosition}</span>
                      </div>
                    </>
                  )}
                </div>
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
          </div>
          
          {/* Right column with form */}
          <div className="md:col-span-2">
            <Card className="relative overflow-hidden">
              {/* Left accent border */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ background: `hsl(var(--teal))` }}
              />
              
              {/* Success indicator that slides in when save is successful */}
              <div 
                className={cn(
                  "absolute right-4 top-4 flex items-center transition-all duration-300 ease-in-out",
                  saveSuccess ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                )}
              >
                <CheckCircle className="text-padeliga-green mr-2" size={16} />
                <span className="text-sm text-padeliga-green">Saved successfully</span>
              </div>
              
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-4 border-b">
                <CardTitle>{hasProfile ? "Edit Your Profile" : "Create Your Player Profile"}</CardTitle>
                <CardDescription>
                  Fill in your padel player details to help teammates and opponents know more about you.
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-padeliga-teal" />
                      Nickname *
                    </Label>
                    <Input
                      id="nickname"
                      placeholder="Your padel nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      required
                      className="border-input/50 focus:border-padeliga-teal"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how you'll be known to other players in the league.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="skillLevel" className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-padeliga-teal" />
                        Skill Level *
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="handedness" className="flex items-center">
                        <span className="flex items-center justify-center w-4 h-4 mr-2 text-padeliga-teal">✋</span>
                        Handedness *
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="preferredPosition" className="flex items-center">
                        <span className="flex items-center justify-center w-4 h-4 mr-2 text-padeliga-teal">🎾</span>
                        Preferred Position *
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="flex items-center">
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-padeliga-teal" />
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell other players about yourself, your experience, playing style, etc."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="border-input/50 focus:border-padeliga-teal"
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between py-6 border-t">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => window.history.back()}
                    className="border-padeliga-purple/50 text-padeliga-purple hover:bg-padeliga-purple/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-padeliga-teal to-padeliga-teal/80 hover:from-padeliga-teal/90 hover:to-padeliga-teal/70"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⟳</span> 
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        {hasProfile ? "Update Profile" : "Create Profile"}
                      </span>
                    )}
                  </Button>
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
