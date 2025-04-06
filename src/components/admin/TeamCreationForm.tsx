"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Plus, X, UserPlus } from "lucide-react";
import { getRandomTeamName } from "@/utils/teamNameSuggestions";

interface Player {
  id: string;
  _id?: string;
  nickname: string;
  email?: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
}

interface TeamCreationFormProps {
  leagueId: string;
  onTeamCreated?: () => void;
}

export function TeamCreationForm({ leagueId, onTeamCreated }: TeamCreationFormProps) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Load available players
  useEffect(() => {
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
    
    fetchPlayers();
    
    // Initialize with a random team name
    setTeamName(getRandomTeamName());
  }, []);
  
  // Search players
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
  
  // Add player to team
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
      if (onTeamCreated) {
        onTeamCreated();
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Team for League</CardTitle>
        <CardDescription>
          Create a new team by selecting players
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
              <Shuffle className="h-4 w-4" />
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
                <p className="text-sm">Select players from the table below</p>
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
        
        {/* Player Search and Selection */}
        <div className="space-y-2">
          <Label>Add Players</Label>
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
                  <TableHead>Handedness</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPlayers ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
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
                      <TableCell>{
                        player.handedness === 'right' ? 'Right' : 
                        player.handedness === 'left' ? 'Left' : 'Ambidextrous'
                      }</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => addPlayerToTeam(player)}
                          disabled={selectedPlayers.some(p => p.id === player.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <div className="py-8 text-muted-foreground">
                        No players found
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateTeam} 
          disabled={isCreating || selectedPlayers.length === 0 || !teamName.trim()}
          className="ml-auto"
        >
          {isCreating ? 'Creating...' : 'Create Team'}
        </Button>
      </CardFooter>
    </Card>
  );
}