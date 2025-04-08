"use client";

import { useState, useEffect, useRef } from "react";
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
  
  // Use refs to prevent multiple unnecessary updates
  const hasUpdatedRef = useRef(false);
  
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

  // Reset the update ref when we unmount
  useEffect(() => {
    return () => {
      hasUpdatedRef.current = false;
    };
  }, []);

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
        
        // Only notify the parent once per session to prevent multiple page reloads
        // and only if it's absolutely necessary
        if (onPlayersUpdated && !hasUpdatedRef.current) {
          // Set the ref to true to prevent further updates
          hasUpdatedRef.current = true;
          
          // Store the current URL to check if navigation occurs
          const currentUrl = window.location.href;
          
          // Call with a larger delay to let animations complete
          // and to allow cancellation if navigation occurs
          const timeoutId = setTimeout(() => {
            // Only call if we're still on the same page (no navigation occurred)
            if (currentUrl === window.location.href) {
              onPlayersUpdated();
            }
          }, 1500);
          
          // Clear the timeout if we unmount
          return () => clearTimeout(timeoutId);
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
      
      // Only call the callback if absolutely necessary and not already called
      if (onPlayersUpdated && !hasUpdatedRef.current) {
        hasUpdatedRef.current = true;
        
        // We use the same approach of delayed update with navigation check
        const currentUrl = window.location.href;
        const timeoutId = setTimeout(() => {
          if (currentUrl === window.location.href) {
            onPlayersUpdated();
          }
        }, 1500);
        
        return () => clearTimeout(timeoutId);
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
