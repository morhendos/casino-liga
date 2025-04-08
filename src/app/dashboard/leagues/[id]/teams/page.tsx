"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { TeamCreationForm } from "@/components/admin/TeamCreationForm";

interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
}

interface Team {
  id: string;
  _id: string;
  name: string;
  players: Player[];
  isActive: boolean;
  createdBy: string;
}

function LeagueTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState("existing");
  
  const leagueId = params.id as string;
  
  useEffect(() => {
    async function fetchLeagueData() {
      try {
        setIsLoading(true);
        
        // Fetch league details
        const leagueResponse = await fetch(`/api/leagues/${leagueId}`);
        if (!leagueResponse.ok) {
          throw new Error('Failed to fetch league details');
        }
        
        const leagueData = await leagueResponse.json();
        setLeague(leagueData);
        
        // Fetch teams in this league
        const teamsResponse = await fetch(`/api/leagues/${leagueId}/teams`);
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch teams');
        }
        
        const teamsData = await teamsResponse.json();
        
        if (teamsData.teams) {
          // Normalize team IDs
          const processedTeams = teamsData.teams.map((team: any) => ({
            ...team,
            id: team._id || team.id,
            players: (team.players || []).map((player: any) => ({
              ...player,
              id: player._id || player.id
            }))
          }));
          
          setTeams(processedTeams);
        }
      } catch (error) {
        console.error("Error fetching league data:", error);
        toast.error("Failed to load league and team data");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagueData();
  }, [leagueId]);
  
  const handleTeamCreated = () => {
    // Refresh teams list
    fetch(`/api/leagues/${leagueId}/teams`)
      .then(response => response.json())
      .then(data => {
        if (data.teams) {
          // Normalize team IDs
          const processedTeams = data.teams.map((team: any) => ({
            ...team,
            id: team._id || team.id,
            players: (team.players || []).map((player: any) => ({
              ...player,
              id: player._id || player.id
            }))
          }));
          
          setTeams(processedTeams);
          
          // Switch to existing teams tab
          setActiveTab("existing");
        }
      })
      .catch(error => {
        console.error("Error refreshing teams:", error);
      });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading league data...</div>
        </div>
      </div>
    );
  }
  
  if (!league) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">League not found</h2>
          <Button asChild>
            <Link href="/dashboard/leagues">Back to Leagues</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-2">
        <Button variant="ghost" className="px-0" asChild>
          <Link href={`/dashboard/leagues/${leagueId}/manage`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League Management
          </Link>
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <p className="text-muted-foreground mt-1">Team Management</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="existing">
            <Users className="h-4 w-4 mr-2" />
            Existing Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Teams in {league.name}</CardTitle>
              <CardDescription>
                Manage existing teams in this league
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teams.map(team => (
                    <Card key={team.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>
                          {team.players.length === 1 ? "1 player" : `${team.players.length} players`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {team.players.map(player => (
                            <div key={player.id} className="flex items-center p-2 bg-muted rounded-md">
                              <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center font-medium mr-2">
                                {player.nickname.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{player.nickname}</div>
                                <div className="text-xs text-muted-foreground">
                                  Skill: {player.skillLevel} • 
                                  {player.handedness === 'right' ? 'Right' : 
                                   player.handedness === 'left' ? 'Left' : 'Ambi'}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {team.players.length < 2 && (
                            <div className="text-center p-2 border border-dashed rounded-md text-sm text-muted-foreground">
                              Team needs one more player
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This league doesn't have any teams yet. Create teams to get started.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <TeamCreationForm 
            leagueId={leagueId} 
            onTeamCreated={handleTeamCreated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withRoleAuth(LeagueTeamsPage, [ROLES.ADMIN]);
