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

// Define interface for player data
interface PlayerProfile {
  id?: string;
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
      
      let response;
      
      if (hasProfile && playerData?.id) {
        // Update existing profile - use the id from the fetched playerData, not from formData
        response = await fetch(`/api/players/${playerData.id}`, {
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
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }
      
      const result = await response.json();
      setPlayerData(result);
      setHasProfile(true);
      
      toast.success(hasProfile ? "Player profile updated" : "Player profile created");
    } catch (error) {
      console.error("Error saving player profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save player profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Player Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{hasProfile ? "Edit Your Profile" : "Create Your Player Profile"}</CardTitle>
            <CardDescription>
              Fill in your padel player details to help teammates and opponents know more about you.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname *</Label>
                <Input
                  id="nickname"
                  placeholder="Your padel nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This is how you'll be known to other players in the league.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level *</Label>
                  <Select
                    value={skillLevel}
                    onValueChange={setSkillLevel}
                  >
                    <SelectTrigger id="skillLevel">
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
                  <Label htmlFor="handedness">Handedness *</Label>
                  <Select
                    value={handedness}
                    onValueChange={setHandedness}
                  >
                    <SelectTrigger id="handedness">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredPosition">Preferred Position *</Label>
                  <Select
                    value={preferredPosition}
                    onValueChange={setPreferredPosition}
                  >
                    <SelectTrigger id="preferredPosition">
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
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="Your phone number (optional)"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell other players about yourself, your experience, playing style, etc."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(PlayerProfilePage);
