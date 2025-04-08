'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, UserPlus, X, Users, UserCheck, RefreshCw, ListOrdered, Sparkles, Trash, AlertCircle, ArrowRight, Check } from "lucide-react";
import { getRandomTeamName } from "@/utils/teamNameSuggestions";

interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  email?: string;
  status?: string;
  handedness?: string;
  preferredPosition?: string;
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
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [leagueTeams, setLeagueTeams] = useState<Team[]>([]);
  const [playersInTeams, setPlayersInTeams] = useState<Set<string>>(new Set());
  const [teamNameMode, setTeamNameMode] = useState<'manual' | 'sequential' | 'funny'>('manual');
  const [nextSequentialLetter, setNextSequentialLetter] = useState('A');
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  
  // New player creation state
  const [showNewPlayerDialog, setShowNewPlayerDialog] = useState(false);
  const [newPlayerNickname, setNewPlayerNickname] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerSkillLevel, setNewPlayerSkillLevel] = useState('5');
  const [newPlayerHandedness, setNewPlayerHandedness] = useState('right');
  const [newPlayerPosition, setNewPlayerPosition] = useState('both');
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // Fetch available players and league teams when component mounts
  useEffect(() => {
    fetchAvailablePlayers();
    fetchLeagueTeams();
  }, [leagueId]);

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

  // Track which players are already in teams and update sequential letter
  useEffect(() => {
    // Create a set of player IDs that are already in teams
    const playerIdsInTeams = new Set<string>();
    
    leagueTeams.forEach(team => {
      team.players.forEach(player => {
        playerIdsInTeams.add(player.id);
      });
    });
    
    setPlayersInTeams(playerIdsInTeams);
    
    // Update the next sequential letter
    updateNextSequentialLetter(leagueTeams);
  }, [leagueTeams]);
  
  // Update team name when team name mode changes
  useEffect(() => {
    updateTeamName();
  }, [teamNameMode, nextSequentialLetter]);

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

  const fetchLeagueTeams = async () => {
    try {
      setIsLoadingTeams(true);
      const response = await fetch(`/api/leagues/${leagueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch league data');
      }
      const data = await response.json();
      
      // Process teams to ensure consistent ID format for teams and players
      const processedTeams = data.teams?.map((team: any) => ({
        ...team,
        id: team._id || team.id,
        players: team.players?.map((player: any) => ({
          ...player,
          id: player._id || player.id
        })) || []
      })) || [];
      
      setLeagueTeams(processedTeams);
    } catch (error) {
      console.error('Error fetching league teams:', error);
      toast.error('Failed to load league teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };
  
  // Update the next sequential letter based on existing teams
  const updateNextSequentialLetter = (teams: Team[]) => {
    const letterTeams = teams.filter(team => 
      team.name.match(/^Team [A-Z]$/)
    );
    
    if (letterTeams.length === 0) {
      setNextSequentialLetter('A');
      return;
    }
    
    // Find the highest letter used
    const highestLetter = letterTeams
      .map(team => team.name.charAt(team.name.length - 1))
      .sort()
      .pop() || 'A';
    
    // Get the next letter in sequence
    const nextLetter = String.fromCharCode(highestLetter.charCodeAt(0) + 1);
    setNextSequentialLetter(nextLetter);
  };
  
  // Generate a team name based on the selected mode
  const updateTeamName = () => {
    switch (teamNameMode) {
      case 'sequential':
        setTeamName(`Team ${nextSequentialLetter}`);
        break;
      case 'funny':
        setTeamName(getRandomTeamName());
        break;
      // For manual mode, keep the existing name
    }
  };
  
  // Generate a new random funny team name
  const generateRandomFunnyName = () => {
    setTeamName(getRandomTeamName());
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
      
      // Create team with selected players and add to league
      const response = await fetch(`/api/leagues/${leagueId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: teamName,
          players: selectedPlayers.map(player => player.id)
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create team');
      }

      toast.success('Team created and added to league successfully');
      
      // Reset form
      setSelectedPlayers([]);
      setTeamName('');
      
      // Refresh teams list
      await fetchLeagueTeams();
      
      // Notify parent component about the update to refresh league data
      if (onPlayersUpdated) {
        onPlayersUpdated();
      }
      
      // Switch to teams tab to show the new team
      setActiveTab('teams');
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerNickname.trim()) {
      toast.error('Player nickname is required');
      return;
    }

    try {
      setIsCreatingPlayer(true);
      
      const playerData = {
        nickname: newPlayerNickname,
        skillLevel: parseInt(newPlayerSkillLevel, 10),
        handedness: newPlayerHandedness,
        preferredPosition: newPlayerPosition,
        email: newPlayerEmail.trim() || undefined // Only include email if provided
      };
      
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create player');
      }

      const newPlayer = await response.json();
      
      toast.success('Player created successfully');
      
      // Add the new player to available players
      const playerWithId = {
        ...newPlayer,
        id: newPlayer._id || newPlayer.id
      };
      
      setAvailablePlayers([playerWithId, ...availablePlayers]);
      setFilteredPlayers([playerWithId, ...filteredPlayers]);
      
      // Add the new player to selected players if less than 2 already selected
      if (selectedPlayers.length < 2) {
        setSelectedPlayers([...selectedPlayers, playerWithId]);
      }
      
      // Reset form and close dialog
      resetNewPlayerForm();
      setShowNewPlayerDialog(false);
      
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create player');
    } finally {
      setIsCreatingPlayer(false);
    }
  };
  
  const handleDeleteTeam = async (team: Team) => {
    setTeamToDelete(team);
    setDeleteTeamDialogOpen(true);
  };
  
  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      setIsDeletingTeam(true);
      
      const response = await fetch(`/api/teams/${teamToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      toast.success(`Team "${teamToDelete.name}" deleted successfully`);
      
      // Refresh the teams list
      await fetchLeagueTeams();
      
      // Notify parent component about the update to refresh league data
      if (onPlayersUpdated) {
        onPlayersUpdated();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete team');
    } finally {
      setIsDeletingTeam(false);
      setDeleteTeamDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const resetNewPlayerForm = () => {
    setNewPlayerNickname('');
    setNewPlayerEmail('');
    setNewPlayerSkillLevel('5');
    setNewPlayerHandedness('right');
    setNewPlayerPosition('both');
  };

  // Check if a player is already in any team
  const isPlayerInTeam = (playerId: string): boolean => {
    return playersInTeams.has(playerId);
  };

  // Get team name for a player
  const getPlayerTeamName = (playerId: string): string | null => {
    for (const team of leagueTeams) {
      if (team.players.some(player => player.id === playerId)) {
        return team.name;
      }
    }
    return null;
  };

  // Get player skill level display with colored badge
  const getSkillLevelBadge = (level: number) => {
    let color;
    if (level >= 8) color = "bg-green-100 text-green-800 border-green-300";
    else if (level >= 5) color = "bg-blue-100 text-blue-800 border-blue-300";
    else color = "bg-gray-100 text-gray-800 border-gray-300";
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
        Level {level}
      </span>
    );
  };

  return (
    <div>
      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this team?</AlertDialogTitle>
            <AlertDialogDescription>
              {teamToDelete && (
                <>
                  Team "{teamToDelete.name}" with {teamToDelete.players.length} player(s) will be removed from the league.
                  This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTeam}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTeam} disabled={isDeletingTeam} className="bg-destructive hover:bg-destructive/90">
              {isDeletingTeam ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-2">
          <TabsTrigger value="players" className="text-base py-3">
            <Users className="h-4 w-4 mr-2" />
            Select Players
          </TabsTrigger>
          <TabsTrigger value="teams" className="text-base py-3">
            <Badge className="mr-2" variant="secondary">{leagueTeams.length}</Badge>
            View Teams
          </TabsTrigger>
        </TabsList>

        {/* Players Tab - Player Selection & Team Creation */}
        <TabsContent value="players" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Available Players */}
            <Card className="overflow-hidden border-2 border-muted">
              <CardHeader className="bg-muted/50 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    <span className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Available Players
                    </span>
                  </CardTitle>
                  <Dialog open={showNewPlayerDialog} onOpenChange={setShowNewPlayerDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        New Player
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Player</DialogTitle>
                        <DialogDescription>
                          Add a new player to the system. Players with email addresses can be invited later.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nickname">Nickname *</Label>
                          <Input
                            id="nickname"
                            value={newPlayerNickname}
                            onChange={(e) => setNewPlayerNickname(e.target.value)}
                            placeholder="Player nickname"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email (optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPlayerEmail}
                            onChange={(e) => setNewPlayerEmail(e.target.value)}
                            placeholder="player@example.com"
                          />
                          <p className="text-xs text-muted-foreground">
                            If provided, the player can be invited to join the platform later
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="skillLevel">Skill Level</Label>
                            <Select value={newPlayerSkillLevel} onValueChange={setNewPlayerSkillLevel}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill level" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                    <SelectItem key={level} value={level.toString()}>
                                      {level}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="handedness">Handedness</Label>
                            <Select value={newPlayerHandedness} onValueChange={setNewPlayerHandedness}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select handedness" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="position">Position</Label>
                            <Select value={newPlayerPosition} onValueChange={setNewPlayerPosition}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="forehand">Forehand</SelectItem>
                                <SelectItem value="backhand">Backhand</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowNewPlayerDialog(false)}
                          disabled={isCreatingPlayer}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreatePlayer}
                          disabled={!newPlayerNickname.trim() || isCreatingPlayer}
                        >
                          {isCreatingPlayer ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Player'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative mt-2">
                  <Input
                    placeholder="Search players by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : filteredPlayers.length > 0 ? (
                    <div className="divide-y">
                      {filteredPlayers.map((player) => {
                        const isInTeam = isPlayerInTeam(player.id);
                        const teamName = isInTeam ? getPlayerTeamName(player.id) : null;
                        
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                              selectedPlayers.some(p => p.id === player.id) ? 'bg-primary/5 border-l-4 border-primary' : 
                              isInTeam ? 'bg-muted/30' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-medium flex items-center">
                                {player.nickname}
                                {isInTeam && (
                                  <Badge variant="outline" className="ml-2 flex items-center gap-1 text-xs">
                                    <UserCheck className="h-3 w-3" />
                                    {teamName}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <span className="inline-block mr-2">{getSkillLevelBadge(player.skillLevel)}</span>
                                {player.email && (
                                  <span className="text-xs truncate max-w-[150px]">{player.email}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={selectedPlayers.some(p => p.id === player.id) ? "default" : 
                                     isInTeam ? "outline" : "secondary"}
                              onClick={() => handleAddPlayer(player)}
                              disabled={isInTeam}
                              title={isInTeam ? `Already in team: ${teamName}` : "Add to team"}
                              className={selectedPlayers.some(p => p.id === player.id) ? "bg-primary text-primary-foreground" : ""}
                            >
                              {selectedPlayers.some(p => p.id === player.id) ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : isInTeam ? (
                                "In Team"
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Select
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                      <p className="font-medium">No players found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? "Try another search term or create a new player" : "Create new players using the button above"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column: Team Creation */}
            <Card className="border-2 border-muted">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl">Create Team</CardTitle>
                <CardDescription>Select players and create a team for this league</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Team Name Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="teamName" className="text-base font-medium">Team Name</Label>
                    <Tabs 
                      defaultValue="manual" 
                      onValueChange={(value) => setTeamNameMode(value as 'manual' | 'sequential' | 'funny')}
                      className="w-full"
                    >                    
                      <TabsList className="grid grid-cols-3 w-full mb-4">
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                        <TabsTrigger value="sequential">
                          <ListOrdered className="h-4 w-4 mr-1" />
                          Sequential
                        </TabsTrigger>
                        <TabsTrigger value="funny">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Random
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="flex gap-2 items-center">
                        <Input
                          id="teamName"
                          placeholder={teamNameMode === 'manual' ? "Enter team name" : "Team name will be generated"}
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="flex-1"
                          disabled={teamNameMode !== 'manual'}
                        />
                        {teamNameMode !== 'manual' && (
                          <Button type="button" variant="outline" onClick={updateTeamName} title="Generate another name">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Tabs>
                  </div>
                  
                  {/* Selected Players */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Selected Players ({selectedPlayers.length}/2)</Label>
                    <div className="space-y-3">
                      {selectedPlayers.length > 0 ? (
                        selectedPlayers.map((player, index) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-primary/5"
                          >
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium mr-3`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{player.nickname}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getSkillLevelBadge(player.skillLevel)}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePlayer(player.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 border rounded-md text-center bg-muted/20">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="font-medium">No players selected</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Select players from the left panel to form a team
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-3 bg-muted/20 border-t p-6">
                {selectedPlayers.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center pb-2">
                    Select at least one player to create a team
                  </div>
                ) : !teamName.trim() ? (
                  <div className="text-sm text-muted-foreground text-center pb-2">
                    Enter a team name to continue
                  </div>
                ) : null}
                
                <Button
                  onClick={handleCreateTeam}
                  disabled={selectedPlayers.length === 0 || !teamName.trim() || isCreatingTeam}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingTeam ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Team
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                {selectedPlayers.length > 0 && teamName.trim() && (
                  <p className="text-sm text-center mt-2">
                    Team will be automatically added to this league
                  </p>
                )}
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Teams Tab - Shows all teams in the league */}
        <TabsContent value="teams" className="mt-0">
          <Card className="border-2 border-muted">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Teams in This League
                  </CardTitle>
                  <CardDescription>
                    {leagueTeams.length} teams registered {leagueTeams.length > 0 ? `(${leagueTeams.reduce((count, team) => count + team.players.length, 0)} players total)` : ''}
                  </CardDescription>
                </div>
                
                <Button 
                  onClick={() => setActiveTab('players')}
                  disabled={isLoadingTeams}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingTeams ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : leagueTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {leagueTeams.map((team) => (
                    <Card key={team.id} className="overflow-hidden">
                      <CardHeader className="bg-primary/5 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            {team.name}
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteTeam(team)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete team</span>
                          </Button>
                        </div>
                        <Badge variant="secondary">
                          {team.players.length} player{team.players.length !== 1 ? 's' : ''}
                        </Badge>
                      </CardHeader>
                      
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {team.players.map((player) => (
                            <div key={player.id} className="p-4 flex items-center">
                              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium mr-3`}>
                                {player.nickname.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{player.nickname}</div>
                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                  {getSkillLevelBadge(player.skillLevel)}
                                  {player.handedness && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {player.handedness === 'right' ? 'Right-handed' : 
                                       player.handedness === 'left' ? 'Left-handed' : 'Ambidextrous'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <Users className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Teams Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    This league doesn't have any teams yet. Create teams to get started.
                  </p>
                  <Button onClick={() => setActiveTab('players')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Team
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Search icon component
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
