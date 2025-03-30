"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Users, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  players: any[];
  description?: string;
  logo?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

function TeamsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  
  useEffect(() => {
    async function fetchTeams() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // First, get the player profile to get the player ID
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        const playerData = await playerResponse.json();
        
        if (playerData.players && playerData.players.length > 0) {
          const playerId = playerData.players[0].id;
          
          // Then fetch teams where this player is a member
          const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
          const teamsData = await teamsResponse.json();
          
          if (teamsData.teams) {
            setMyTeams(teamsData.teams);
          }
        } else {
          // No player profile yet
          toast.info("Please create your player profile first before creating or joining teams");
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeams();
  }, [session]);
  
  function TeamCard({ team }: { team: Team }) {
    const teamMembers = team.players || [];
    const hasPartner = teamMembers.length === 2;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {team.name}
          </CardTitle>
          <CardDescription>
            {team.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-medium">Team Members:</div>
            <div className="bg-muted p-3 rounded-md">
              {teamMembers.map((player) => (
                <div key={player.id} className="flex items-center gap-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {player.nickname?.charAt(0) || "P"}
                  </div>
                  <div>
                    <div className="font-medium">{player.nickname}</div>
                    <div className="text-xs text-muted-foreground">
                      Skill: {player.skillLevel} • {player.handedness === "right" ? "Right-handed" : player.handedness === "left" ? "Left-handed" : "Ambidextrous"}
                    </div>
                  </div>
                </div>
              ))}
              
              {!hasPartner && (
                <div className="flex items-center gap-2 py-1 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    ?
                  </div>
                  <div className="italic">Looking for a partner</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={`/dashboard/teams/${team.id}`}>
              Manage Team
            </Link>
          </Button>
          {hasPartner && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={`/dashboard/leagues?teamId=${team.id}`}>
                <Trophy className="w-4 h-4 mr-1" />
                <span>Find Leagues</span>
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <Button asChild>
          <Link href="/dashboard/teams/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading teams...</div>
        </div>
      ) : myTeams.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {myTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't created or joined any teams yet.
            </p>
            <Button asChild>
              <Link href="/dashboard/teams/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Team
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Join Existing Teams</CardTitle>
            <CardDescription>
              You can also join existing teams if you've been invited or if teams are looking for partners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/teams/find" className="text-primary hover:underline">
              Browse Available Teams
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(TeamsPage);
