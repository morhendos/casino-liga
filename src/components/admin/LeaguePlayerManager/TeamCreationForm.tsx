"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  X,
  Users,
  RefreshCw,
  ListOrdered,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TeamNameMode } from "@/hooks/useTeamNameMode";
import { Player } from "@/hooks/useLeagueData";

// Get player skill level display with colored badge
const getSkillLevelBadge = (level: number) => {
  let color;
  if (level >= 8) color = "bg-green-100 text-green-800 border-green-300";
  else if (level >= 5) color = "bg-blue-100 text-blue-800 border-blue-300";
  else color = "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${color}`}
    >
      {level}
    </span>
  );
};

interface TeamCreationFormProps {
  selectedPlayers: Player[];
  teamName: string;
  teamNameMode: TeamNameMode;
  isCreatingTeam: boolean;
  onTeamNameChange: (name: string) => void;
  onTeamNameModeChange: (mode: TeamNameMode) => void;
  onGenerateTeamName: () => void;
  onRemovePlayer: (playerId: string) => void;
  onCreateTeam: () => Promise<void>;
}

export default function TeamCreationForm({
  selectedPlayers,
  teamName,
  teamNameMode,
  isCreatingTeam,
  onTeamNameChange,
  onTeamNameModeChange,
  onGenerateTeamName,
  onRemovePlayer,
  onCreateTeam,
}: TeamCreationFormProps) {
  return (
    <Card className="h-full border-2 border-muted">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl">Create Team</CardTitle>
        <CardDescription>
          Select players and create a team for this league
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Team Name Selection */}
          <div className="space-y-3">
            <Label htmlFor="teamName" className="text-base font-medium">
              Team Name
            </Label>
            <Tabs
              value={teamNameMode}
              onValueChange={(value) => onTeamNameModeChange(value as TeamNameMode)}
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
                  placeholder={
                    teamNameMode === "manual"
                      ? "Enter team name"
                      : "Team name will be generated"
                  }
                  value={teamName}
                  onChange={(e) => onTeamNameChange(e.target.value)}
                  className="flex-1"
                  disabled={teamNameMode !== "manual"}
                />
                {teamNameMode !== "manual" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onGenerateTeamName}
                    title="Generate another name"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Tabs>
          </div>

          {/* Selected Players */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Selected Players ({selectedPlayers.length}/2)
            </Label>
            <div className="space-y-3">
              {selectedPlayers.length > 0 ? (
                selectedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-primary/5"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium mr-3`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {player.nickname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getSkillLevelBadge(player.skillLevel)}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemovePlayer(player.id)}
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
                      Click on players from the left panel to add them to
                      your team
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-3 bg-muted/20 border-t p-6 mt-auto">
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
          onClick={onCreateTeam}
          disabled={
            selectedPlayers.length === 0 ||
            !teamName.trim() ||
            isCreatingTeam
          }
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
  );
}
