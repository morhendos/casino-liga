"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { Team } from "@/hooks/useLeagueData";
import TeamCard from "./TeamCard";

interface TeamListProps {
  leagueTeams: Team[];
  isLoading: boolean;
  onDeleteTeam: (teamId: string, teamName: string) => Promise<boolean>;
  title?: string;
  subtitle?: string;
  variant?: 'compact' | 'detailed';
}

export default function TeamList({
  leagueTeams,
  isLoading,
  onDeleteTeam,
  title = "Teams in This League",
  subtitle,
  variant = 'compact'
}: TeamListProps) {
  const totalPlayers = leagueTeams.reduce(
    (count, team) => count + team.players.length,
    0
  );

  // Generate default subtitle if one is not provided
  const defaultSubtitle = subtitle || 
    `${leagueTeams.length} team${leagueTeams.length !== 1 ? "s" : ""} registered${
      leagueTeams.length > 0 ? ` (${totalPlayers} players total)` : ""
    }`;

  const handleDeleteTeam = async (team: Team) => {
    // No confirmation, directly delete the team
    const success = await onDeleteTeam(team.id, team.name);
    return success;
  };

  return (
    <Card className="h-full border-2 border-muted">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {title}
            </CardTitle>
            <CardDescription>
              {defaultSubtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight: "500px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : leagueTeams.length > 0 ? (
          <div className="space-y-2">
            {leagueTeams.map((team) => (
              <TeamCard 
                key={team.id}
                team={team}
                onDelete={handleDeleteTeam}
                variant={variant}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground">
              No teams have been created yet. Create your first team using
              the form.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
