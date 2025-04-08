"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shuffle } from "lucide-react";
import { getRandomTeamName } from "@/utils/teamNameSuggestions";

interface Player {
  id: string;
  _id?: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  userId: string;
}

function CreateTeamPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string>("none");
  
  // Available players
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    async function fetchPlayerData() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // First, get the current user's player profile
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        
        if (!playerResponse.ok) {
          const errorData = await playerResponse.json();
          throw new Error(errorData.error || "Failed to fetch player profile");
        }
        
        const playerData = await playerResponse.json();
        console.log("Player data response:", playerData);
        
        if (playerData.players && playerData.players.length > 0) {
          const myPlayer = playerData.players[0];
          // Handle both id and _id formats
          const playerId = myPlayer.id || myPlayer._id;
          
          if (!playerId) {
            throw new Error("Could not determine player ID");
          }
          
          setMyPlayerId(playerId);
          console.log("Set my player ID to:", playerId);
          
          // Then fetch all active players for partner selection (excluding the current user)
          const allPlayersResponse = await fetch('/api/players?isActive=true');
          
          if (!allPlayersResponse.ok) {
            const errorData = await allPlayersResponse.json();
            throw new Error(errorData.error || "Failed to fetch available players");
          }
          
          const allPlayersData = await allPlayersResponse.json();
          console.log("All players data:", allPlayersData);
          
          if (allPlayersData.players) {
            // Filter out the current user's player
            const otherPlayers = allPlayersData.players.filter(
              (player: Player) => (player.id || player._id) !== playerId
            );
            setAvailablePlayers(otherPlayers);
            console.log("Set available players:", otherPlayers.length);
          }
        } else {
          // No player profile yet
          toast.error("You need to create your player profile first", {
            description: "Before creating a team, you must set up your player profile.",
            action: {
              label: "Create Profile",
              onClick: () => router.push("/dashboard/player-profile")
            }
          });
          
          // Redirect to player profile creation
          setTimeout(() => {
            router.push("/dashboard/player-profile");
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load player data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlayerData();
    
    // Set a random team name initially
    setName(getRandomTeamName());
  }, [session, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!myPlayerId) {
      toast.error("You need to create your player profile first");
      return;
    }
    
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      const teamData = {
        name: name.trim(),
        // Only include partnerId if it's not "none"
        players: partnerId !== "none" ? [myPlayerId, partnerId] : [myPlayerId]
      };
      
      console.log("Submitting team data:", teamData);
      
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }
      
      const team = await response.json();
      console.log("Team created successfully:", team);
      
      toast.success("Team created successfully", {
        description: partnerId !== "none" 
          ? "Your team is now ready to join leagues!" 
          : "Your team is created. You can add a partner later."
      });
      
      // Redirect to team details
      router.push(`/dashboard/teams/${team.id || team._id}`);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create team");
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Generate a new random team name
  const generateRandomName = () => {
    setName(getRandomTeamName());
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New Team</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
            <CardDescription>
              Create a new padel team. You can either start a team by yourself and find a partner later, 
              or create a complete team with an existing partner.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex justify-between items-center">
                  <span>Team Name *</span>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    onClick={generateRandomName}
                    className="h-8 px-2 text-xs flex items-center gap-1"
                    disabled={isLoading || formSubmitting}
                  >
                    <Shuffle className="h-3 w-3" />
                    Random Name
                  </Button>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="name"
                    placeholder="Enter your team name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading || formSubmitting}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Team Members</h3>
                
                <div className="space-y-4">
                  <div className="bg-background p-3 rounded-md border">
                    <div className="text-sm text-muted-foreground mb-1">You</div>
                    {myPlayerId ? (
                      <div className="font-medium">
                        Your player profile is ready to be assigned to this team.
                      </div>
                    ) : (
                      <div className="text-destructive">
                        You need to create your player profile first.
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partner">Team Partner (Optional)</Label>
                    <Select
                      value={partnerId}
                      onValueChange={setPartnerId}
                      disabled={isLoading || formSubmitting}
                    >
                      <SelectTrigger id="partner">
                        <SelectValue placeholder="Select a partner or leave empty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No partner (find one later)</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id || player._id} value={player.id || player._id}>
                            {player.nickname} - Skill: {player.skillLevel} - {player.handedness === "right" ? "Right" : player.handedness === "left" ? "Left" : "Ambi"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      You can add a partner now or find one later. A team requires exactly 2 players to participate in leagues.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/dashboard/teams")}
                disabled={formSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || formSubmitting || !myPlayerId}
              >
                {formSubmitting ? "Creating..." : "Create Team"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have a player profile yet?{" "}
            <Link href="/dashboard/player-profile" className="text-primary hover:underline">
              Create your player profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CreateTeamPage);
