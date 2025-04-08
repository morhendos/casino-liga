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

  useEffect(() => {
    fetchAvailablePlayers();
  }, [fetchAvailablePlayers]);

  return {
    availablePlayers,
    setAvailablePlayers,
    isLoading,
    fetchAvailablePlayers,
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
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete team");
      }

      // Refresh the teams list
      await fetchLeagueTeams();
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
  const createTeam = async (name: string, playerIds: string[]) => {
    try {
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
        const error = await response.json();
        throw new Error(error.error || "Failed to create team");
      }

      // Refresh the teams list
      await fetchLeagueTeams();
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
