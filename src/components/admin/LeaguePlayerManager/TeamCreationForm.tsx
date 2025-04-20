"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamNameMode } from "@/hooks/useTeamNameMode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Player } from "@/hooks/useLeagueData";
import { RefreshCcw, X } from "lucide-react";

interface TeamCreationFormProps {
  selectedPlayers: Player[];
  teamName: string;
  teamNameMode: TeamNameMode;
  isCreatingTeam: boolean;
  leagueId: string; // Add leagueId prop
  onTeamNameChange: (value: string) => void;
  onTeamNameModeChange: (mode: TeamNameMode) => void;
  onGenerateTeamName: () => void;
  onRemovePlayer: (playerId: string) => void;
  onCreateTeam: () => void;
}

export default function TeamCreationForm({
  selectedPlayers,
  teamName,
  teamNameMode,
  isCreatingTeam,
  leagueId, // Use leagueId prop
  onTeamNameChange,
  onTeamNameModeChange,
  onGenerateTeamName,
  onRemovePlayer,
  onCreateTeam,
}: TeamCreationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team-name">Team Name</Label>
          <div className="flex space-x-2">
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => onTeamNameChange(e.target.value)}
              placeholder="Enter team name"
              autoComplete="off"
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={onGenerateTeamName}
              title="Generate team name"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="naming-scheme">Naming Scheme</Label>
          <Select
            value={teamNameMode}
            onValueChange={(value) => onTeamNameModeChange(value as TeamNameMode)}
          >
            <SelectTrigger id="naming-scheme">
              <SelectValue placeholder="Select naming scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sequential">Sequential (Team A, Team B, ...)</SelectItem>
              <SelectItem value="player">Player-based (First names)</SelectItem>
              <SelectItem value="funny">Funny names</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Selected Players</Label>
          <div className="border rounded-md p-2 min-h-24">
            {selectedPlayers.length === 0 ? (
              <div className="text-muted-foreground text-sm flex items-center justify-center h-20">
                No players selected
              </div>
            ) : (
              <ul className="space-y-2">
                {selectedPlayers.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div>
                      <span className="font-semibold">{player.nickname}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (Level: {player.skillLevel})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePlayer(player.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={onCreateTeam}
          disabled={isCreatingTeam || selectedPlayers.length === 0 || !teamName.trim()}
        >
          {isCreatingTeam ? "Creating..." : "Create Team"}
        </Button>
      </CardContent>
    </Card>
  );
}