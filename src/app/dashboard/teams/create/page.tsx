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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Player {
  id: string;
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
  const [description, setDescription] = useState("");
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string>("");
  
  // Available players
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    async function fetchPlayerData() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // First, get the current user's player profile
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        const playerData = await playerResponse.json();
        
        if (playerData.players && playerData.players.length > 0) {
          const myPlayer = playerData.players[0];
          setMyPlayerId(myPlayer.id);
          
          // Then fetch all active players for partner selection (excluding the current user)
          const allPlayersResponse = await fetch('/api/players?isActive=true');
          const allPlayersData = await allPlayersResponse.json();
          
          if (allPlayersData.players) {
            // Filter out the current user's player
            const otherPlayers = allPlayersData.players.filter(
              (player: Player) => player.id !== myPlayer.id
            );
            setAvailablePlayers(otherPlayers);
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
        toast.error("Failed to load player data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPlayerData();
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
        description,
        players: partnerId ? [myPlayerId, partnerId] : [myPlayerId]
      };
      
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
      
      toast.success("Team created successfully", {
        description: partnerId 
          ? "Your team is now ready to join leagues!" 
          : "Your team is created. You can add a partner later."
      });
      
      // Redirect to team details
      router.push(`/dashboard/teams/${team.id}`);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create team");
    } finally {
      setFormSubmitting(false);
    }
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
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your team name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading || formSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Team Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your team, playing style, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading || formSubmitting}
                  rows={3}
                />
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
                        <SelectItem value="">No partner (find one later)</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
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
