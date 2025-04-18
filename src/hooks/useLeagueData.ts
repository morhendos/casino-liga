import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  email?: string;
  status?: string;
  handedness?: string;
  preferredPosition?: string;
}

export interface Team {
  id: string;
  _id: string;
  name: string;
  players: Player[];
}

export interface League {
  id: string;
  _id: string;
  name: string;
  teams: Team[];
}

export const useAvailablePlayers = () => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailablePlayers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/players");
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      const data = await response.json();

      // Process players to ensure consistent ID format
      const processedPlayers = data.players.map((player: any) => ({
        ...player,
        id: player._id || player.id,
      }));

      setAvailablePlayers(processedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePlayer = async (playerId: string) => {
    try {
      // Optimistically update UI first
      const playerToDelete = availablePlayers.find(player => player.id === playerId);
      if (!playerToDelete) return false;
      
      // Remove player from local state immediately
      setAvailablePlayers(prev => prev.filter(player => player.id !== playerId));
      
      // Send request to server
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If failed, revert the optimistic update
        if (playerToDelete) {
          setAvailablePlayers(prev => [...prev, playerToDelete]);
        }
        throw new Error("Failed to delete player");
      }

      return true;
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete player"
      );
      return false;
    }
  };

  useEffect(() => {
    fetchAvailablePlayers();
  }, [fetchAvailablePlayers]);

  return {
    availablePlayers,
    setAvailablePlayers,
    isLoading,
    fetchAvailablePlayers,
    deletePlayer
  };
};

export const useLeagueTeams = (leagueId: string) => {
  const [leagueTeams, setLeagueTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playersInTeams, setPlayersInTeams] = useState<Set<string>>(new Set());

  const fetchLeagueTeams = useCallback(async () => {
    if (!leagueId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/leagues/${leagueId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch league data");
      }
      const data = await response.json();

      // Process teams to ensure consistent ID format for teams and players
      const processedTeams =
        data.teams?.map((team: any) => ({
          ...team,
          id: team._id || team.id,
          players:
            team.players?.map((player: any) => ({
              ...player,
              id: player._id || player.id,
            })) || [],
        })) || [];

      setLeagueTeams(processedTeams);
      
      // Update the set of player IDs that are already in teams
      const playerIdsInTeams = new Set<string>();
      processedTeams.forEach((team) => {
        team.players.forEach((player) => {
          playerIdsInTeams.add(player.id);
        });
      });
      setPlayersInTeams(playerIdsInTeams);
      
    } catch (error) {
      console.error("Error fetching league teams:", error);
      toast.error("Failed to load league teams");
    } finally {
      setIsLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchLeagueTeams();
  }, [fetchLeagueTeams]);

  // Delete a team from the league
  const deleteTeam = async (teamId: string) => {
    try {
      // Optimistically update UI first
      const teamToDelete = leagueTeams.find(team => team.id === teamId);
      if (!teamToDelete) return false;
      
      // Remove team from local state immediately
      setLeagueTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
      
      // Update players in teams set
      const updatedPlayersInTeams = new Set(playersInTeams);
      teamToDelete.players.forEach(player => {
        updatedPlayersInTeams.delete(player.id);
      });
      setPlayersInTeams(updatedPlayersInTeams);

      // Send request to server
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If failed, revert the optimistic update
        setLeagueTeams(prevTeams => [...prevTeams, teamToDelete]);
        
        // Restore players in teams set
        teamToDelete.players.forEach(player => {
          updatedPlayersInTeams.add(player.id);
        });
        setPlayersInTeams(updatedPlayersInTeams);
        
        throw new Error("Failed to delete team");
      }

      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete team"
      );
      return false;
    }
  };

  // Create a team in the league
  const createTeam = async (name: string, playerIds: string[], playerDetails: Player[]) => {
    try {
      // Create a temporary ID for the optimistic update
      const tempId = `temp-${Date.now()}`;
      
      // Create a new team object with the selected players
      const newTeam: Team = {
        id: tempId,
        _id: tempId,
        name,
        players: playerDetails
      };
      
      // Optimistically update UI immediately
      setLeagueTeams(prevTeams => [...prevTeams, newTeam]);
      
      // Update players in teams set
      const updatedPlayersInTeams = new Set(playersInTeams);
      playerIds.forEach(id => {
        updatedPlayersInTeams.add(id);
      });
      setPlayersInTeams(updatedPlayersInTeams);

      // Send the actual request to the server
      const response = await fetch(`/api/leagues/${leagueId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          players: playerIds,
        }),
      });

      if (!response.ok) {
        // If failed, revert the optimistic update
        setLeagueTeams(prevTeams => prevTeams.filter(team => team.id !== tempId));
        
        // Restore players in teams set
        playerIds.forEach(id => {
          updatedPlayersInTeams.delete(id);
        });
        setPlayersInTeams(updatedPlayersInTeams);
        
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }
      
      // Get the real team data from response
      const serverTeam = await response.json();
      
      // Update the team in state with the real ID from server
      setLeagueTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === tempId 
            ? {
                ...team,
                id: serverTeam._id || serverTeam.id,
                _id: serverTeam._id || serverTeam.id
              } 
            : team
        )
      );

      return true;
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create team"
      );
      return false;
    }
  };

  return {
    leagueTeams,
    isLoading,
    playersInTeams,
    fetchLeagueTeams,
    deleteTeam,
    createTeam,
  };
};

export const usePlayerManagement = () => {
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  const createPlayer = async (playerData: {
    nickname: string;
    skillLevel: number;
    handedness?: string;
    preferredPosition?: string;
    email?: string;
  }) => {
    try {
      setIsCreatingPlayer(true);

      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create player");
      }

      const newPlayer = await response.json();
      toast.success("Player created successfully");

      // Format player data to include id
      const playerWithId = {
        ...newPlayer,
        id: newPlayer._id || newPlayer.id,
      };

      setIsCreatingPlayer(false);
      return playerWithId;
    } catch (error) {
      console.error("Error creating player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create player"
      );
      setIsCreatingPlayer(false);
      return null;
    }
  };

  return {
    isCreatingPlayer,
    createPlayer,
  };
};
