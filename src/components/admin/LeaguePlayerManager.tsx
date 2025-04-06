'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus, X } from "lucide-react";

interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  email?: string;
  status?: string;
}

interface Team {
  id: string;
  _id: string;
  name: string;
  players: Player[];
}

interface League {
  id: string;
  _id: string;
  name: string;
  teams: Team[];
}

interface LeaguePlayerManagerProps {
  leagueId: string;
  onPlayersUpdated?: () => void;
}

export default function LeaguePlayerManager({ leagueId, onPlayersUpdated }: LeaguePlayerManagerProps) {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  // Fetch available players when component mounts
  useEffect(() => {
    fetchAvailablePlayers();
  }, []);

  // Filter players based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlayers(availablePlayers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availablePlayers.filter(player => 
      player.nickname.toLowerCase().includes(query) || 
      player.email?.toLowerCase().includes(query)
    );
    setFilteredPlayers(filtered);
  }, [searchQuery, availablePlayers]);

  const fetchAvailablePlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/players');
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      
      // Process players to ensure consistent ID format
      const processedPlayers = data.players.map((player: any) => ({
        ...player,
        id: player._id || player.id
      }));
      
      setAvailablePlayers(processedPlayers);
      setFilteredPlayers(processedPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = (player: Player) => {
    if (selectedPlayers.length >= 2) {
      toast.error('A team can have a maximum of 2 players');
      return;
    }
    
    // Check if player is already selected
    if (selectedPlayers.some(p => p.id === player.id)) {
      toast.error('This player is already selected');
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id !== playerId));
  };

  const handleCreateTeam = async () => {
    if (selectedPlayers.length === 0) {
      toast.error('Please select at least one player');
      return;
    }

    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      setIsCreatingTeam(true);
      
      // Create team with selected players
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          playerIds: selectedPlayers.map(player => player.id),
          leagueId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team');
      }

      toast.success('Team created successfully');
      
      // Reset form
      setSelectedPlayers([]);
      setTeamName('');
      
      // Notify parent component about the update
      if (onPlayersUpdated) {
        onPlayersUpdated();
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleNewPlayerClick = () => {
    // We'll use the PlayerInvitationManagement component through our parent
    toast.info('Please use the Invitations tab to create and invite new players');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Players to League</CardTitle>
          <CardDescription>
            Select players and form teams for this league
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleNewPlayerClick}>
                <UserPlus className="h-4 w-4 mr-2" />
                New Player
              </Button>
            </div>
            
            <div className="h-60 overflow-y-auto border rounded-md p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredPlayers.length > 0 ? (
                <div className="space-y-2">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{player.nickname}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.email || 'No email'} • Level: {player.skillLevel}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddPlayer(player)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No players found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Team</CardTitle>
          <CardDescription>
            Form a team with selected players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Selected Players</Label>
              <div className="mt-2 space-y-2">
                {selectedPlayers.length > 0 ? (
                  selectedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div>
                        <div className="font-medium">{player.nickname}</div>
                        <div className="text-sm text-muted-foreground">
                          Level: {player.skillLevel}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePlayer(player.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground border rounded-md">
                    No players selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleCreateTeam}
            disabled={selectedPlayers.length === 0 || !teamName.trim() || isCreatingTeam}
            className="w-full"
          >
            {isCreatingTeam ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Team & Add to League'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
