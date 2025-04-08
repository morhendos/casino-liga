"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  PlayerList, 
  TeamCreationForm, 
  TeamList 
} from "./LeaguePlayerManager/index";
import { 
  useAvailablePlayers, 
  useLeagueTeams,
  usePlayerManagement,
  Player
} from "@/hooks/useLeagueData";
import { 
  useTeamNameMode, 
  useTeamName, 
  TeamNameMode 
} from "@/hooks/useTeamNameMode";

interface LeaguePlayerManagerProps {
  leagueId: string;
  onPlayersUpdated?: () => void;
}

export default function LeaguePlayerManager({
  leagueId,
  onPlayersUpdated,
}: LeaguePlayerManagerProps) {
  // Player selection state
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  
  // Custom hooks
  const { 
    availablePlayers, 
    setAvailablePlayers, 
    isLoading: isLoadingPlayers, 
    fetchAvailablePlayers 
  } = useAvailablePlayers();
  
  const { 
    leagueTeams, 
    isLoading: isLoadingTeams, 
    playersInTeams, 
    fetchLeagueTeams,
    deleteTeam,
    createTeam
  } = useLeagueTeams(leagueId);
  
  const { 
    isCreatingPlayer, 
    createPlayer 
  } = usePlayerManagement();
  
  const { 
    teamNameMode, 
    setTeamNameMode 
  } = useTeamNameMode();
  
  const { 
    teamName, 
    setTeamName, 
    updateNextSequentialLetter,
    updateTeamName,
    generateRandomFunnyName
  } = useTeamName();

  // Update next sequential letter when teams change
  useEffect(() => {
    updateNextSequentialLetter(leagueTeams);
  }, [leagueTeams]);

  // Update team name when team name mode changes or upon initial load
  useEffect(() => {
    updateTeamName();
  }, [teamNameMode]);

  const handleAddPlayer = (player: Player) => {
    if (selectedPlayers.length >= 2) {
      toast.error("A team can have a maximum of 2 players");
      return;
    }

    // Check if player is already selected
    if (selectedPlayers.some((p) => p.id === player.id)) {
      toast.error("This player is already selected");
      return;
    }

    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(
      selectedPlayers.filter((player) => player.id !== playerId)
    );
  };

  const handleCreateTeam = async () => {
    if (selectedPlayers.length === 0) {
      toast.error("Please select at least one player");
      return;
    }

    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    try {
      setIsCreatingTeam(true);
      
      // Pass player IDs and full player details for optimistic UI update
      const success = await createTeam(
        teamName,
        selectedPlayers.map((player) => player.id),
        selectedPlayers
      );

      if (success) {
        toast.success("Team created and added to league successfully");
        
        // Reset selected players
        setSelectedPlayers([]);
        
        // Clear the team name
        setTeamName("");
        
        // Generate a new team name based on the current mode (after a brief delay)
        setTimeout(() => {
          updateTeamName();
        }, 50);
        
        // We don't need to call onPlayersUpdated() anymore since we're using optimistic updates
        // This was likely causing the full page refresh
        // Instead, we can call it after a delay if needed for syncing with other components
        if (onPlayersUpdated) {
          // Call with a small delay to let animations complete
          setTimeout(() => {
            onPlayersUpdated();
          }, 300);
        }
      }
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleCreatePlayer = async (playerData: any) => {
    const newPlayer = await createPlayer(playerData);
    
    if (newPlayer) {
      // Add the new player to available players
      setAvailablePlayers([newPlayer, ...availablePlayers]);
      
      // Add the new player to selected players if less than 2 already selected
      if (selectedPlayers.length < 2) {
        setSelectedPlayers([...selectedPlayers, newPlayer]);
      }
      
      return newPlayer;
    }
    
    return null;
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    const success = await deleteTeam(teamId);
    
    if (success) {
      toast.success(`Team "${teamName}" deleted successfully`);
      
      // We don't need to notify parent immediately, but can do it with a small delay
      // to let the UI animation complete
      if (onPlayersUpdated) {
        setTimeout(() => {
          onPlayersUpdated();
        }, 300);
      }
    }
    
    return success;
  };

  const handleTeamNameChange = (value: string) => {
    setTeamName(value);
  };

  const handleTeamNameModeChange = (mode: TeamNameMode) => {
    setTeamNameMode(mode);
  };

  const handleGenerateTeamName = () => {
    if (teamNameMode === "funny") {
      generateRandomFunnyName();
    } else {
      updateTeamName();
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Available Players */}
          <PlayerList
            availablePlayers={availablePlayers}
            isLoading={isLoadingPlayers}
            selectedPlayers={selectedPlayers}
            playersInTeams={playersInTeams}
            onAddPlayer={handleAddPlayer}
            onCreatePlayer={handleCreatePlayer}
            isCreatingPlayer={isCreatingPlayer}
          />

          {/* Column 2: Create Team */}
          <TeamCreationForm
            selectedPlayers={selectedPlayers}
            teamName={teamName}
            teamNameMode={teamNameMode}
            isCreatingTeam={isCreatingTeam}
            onTeamNameChange={handleTeamNameChange}
            onTeamNameModeChange={handleTeamNameModeChange}
            onGenerateTeamName={handleGenerateTeamName}
            onRemovePlayer={handleRemovePlayer}
            onCreateTeam={handleCreateTeam}
          />

          {/* Column 3: Teams in This League */}
          <TeamList
            leagueTeams={leagueTeams}
            isLoading={isLoadingTeams}
            onDeleteTeam={handleDeleteTeam}
          />
        </div>
      </div>
    </div>
  );
}
