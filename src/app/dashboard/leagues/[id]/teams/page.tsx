"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Users, Plus, X, UserPlus, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getRandomTeamName } from "@/utils/teamNameSuggestions";

interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  email?: string;
}

interface Team {
  id: string;
  _id: string;
  name: string;
  players: Player[];
  isActive: boolean;
  createdBy: string;
}

// Component for the Available Players column
function AvailablePlayersColumn({ onAddPlayer }: { onAddPlayer: (player: Player) => void }) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function fetchPlayers() {
    try {
      setIsLoadingPlayers(true);
      let url = '/api/admin/players?status=active';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      
      const data = await response.json();
      
      if (data.players) {
        // Process the players to ensure IDs are normalized
        const processedPlayers = data.players.map((player: any) => ({
          ...player,
          id: player._id || player.id
        }));
        setAvailablePlayers(processedPlayers);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setIsLoadingPlayers(false);
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    try {
      setIsLoadingPlayers(true);
      
      const searchType = searchTerm.includes('@') ? 'email' : 'nickname';
      const url = `/api/admin/players?${searchType}=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to search players");
      }
      
      const data = await response.json();
      
      if (data.players) {
        // Process the players to ensure IDs are normalized
        const processedPlayers = data.players.map((player: any) => ({
          ...player,
          id: player._id || player.id
        }));
        setAvailablePlayers(processedPlayers);
      }
    } catch (error) {
      console.error("Error searching players:", error);
      toast.error("Failed to search players");
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Available Players</CardTitle>
        <CardDescription>
          Select players to add to your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2 mb-3">
          <Input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search players by nickname or email"
            className="flex-1"
          />
          <Button onClick={handleSearch} type="button">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPlayers ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <div className="py-8 text-muted-foreground animate-pulse">
                      Loading players...
                    </div>
                  </TableCell>
                </TableRow>
              ) : availablePlayers.length > 0 ? (
                availablePlayers.map(player => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.nickname}</TableCell>
                    <TableCell>{player.skillLevel}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => onAddPlayer(player)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <div className="py-8 text-muted-foreground">
                      No players found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for the Create Team column
function CreateTeamColumn({ 
  leagueId, 
  selectedPlayers, 
  setSelectedPlayers, 
  onTeamCreated 
}: { 
  leagueId: string, 
  selectedPlayers: Player[],
  setSelectedPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  onTeamCreated: () => void 
}) {
  const [teamName, setTeamName] = useState(getRandomTeamName());
  const [isCreating, setIsCreating] = useState(false);

  // Remove player from team
  const removePlayerFromTeam = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  // Generate a new random team name
  const generateRandomName = () => {
    setTeamName(getRandomTeamName());
  };

  // Create the team
  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    
    if (selectedPlayers.length === 0) {
      toast.error("Please select at least one player for the team");
      return;
    }
    
    try {
      setIsCreating(true);
      
      const response = await fetch(`/api/leagues/${leagueId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          players: selectedPlayers.map(p => p.id),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team');
      }
      
      toast.success("Team created successfully");
      
      // Reset form
      setTeamName(getRandomTeamName());
      setSelectedPlayers([]);
      
      // Callback
      onTeamCreated();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
        <CardDescription>
          Define your team with selected players
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Name */}
        <div className="space-y-2">
          <Label>Team Name</Label>
          <div className="flex space-x-2">
            <Input 
              value={teamName} 
              onChange={e => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={generateRandomName}>
              <span className="sr-only">Generate Random Name</span>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Selected Players */}
        <div className="space-y-2">
          <Label>Team Members</Label>
          <div className="border rounded-md p-4">
            {selectedPlayers.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">
                <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No players added yet</p>
                <p className="text-sm">Select players from the left column</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary h-8 w-8 rounded-full flex items-center justify-center font-medium mr-3">
                        {player.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{player.nickname}</div>
                        <div className="text-xs text-muted-foreground">
                          Skill: {player.skillLevel} • 
                          {player.handedness === 'right' ? 'Right-handed' : 
                           player.handedness === 'left' ? 'Left-handed' : 'Ambidextrous'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removePlayerFromTeam(player.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleCreateTeam} 
          disabled={isCreating || selectedPlayers.length === 0 || !teamName.trim()}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Create Team'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Component for the Teams in League column
function TeamsInLeagueColumn({ teams }: { teams: Team[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Teams in This League</CardTitle>
        <CardDescription>
          {teams.length} team{teams.length !== 1 ? 's' : ''} in this league
        </CardDescription>
      </CardHeader>
      <CardContent>
        {teams.length > 0 ? (
          <div className="space-y-4">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeagueTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [league, setLeague] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  
  const leagueId = params.id as string;
  
  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);
  
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
  
  const handleTeamCreated = () => {
    // Refresh teams list
    fetchLeagueData();
  };
  
  const addPlayerToTeam = (player: Player) => {
    if (selectedPlayers.length >= 2) {
      toast.error("A team can have at most 2 players");
      return;
    }
    
    if (selectedPlayers.some(p => p.id === player.id)) {
      toast.error("This player is already in the team");
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
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
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Column 1: Available Players */}
        <div className="lg:col-span-1">
          <AvailablePlayersColumn onAddPlayer={addPlayerToTeam} />
        </div>
        
        {/* Column 2: Create Team */}
        <div className="lg:col-span-1">
          <CreateTeamColumn 
            leagueId={leagueId}
            selectedPlayers={selectedPlayers}
            setSelectedPlayers={setSelectedPlayers}
            onTeamCreated={handleTeamCreated}
          />
        </div>
        
        {/* Column 3: Teams in This League */}
        <div className="lg:col-span-1">
          <TeamsInLeagueColumn teams={teams} />
        </div>
      </div>
    </div>
  );
}

export default withRoleAuth(LeagueTeamsPage, [ROLES.ADMIN]);