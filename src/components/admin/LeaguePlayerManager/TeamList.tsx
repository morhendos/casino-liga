"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/hooks/useLeagueData";
import { Button } from "@/components/ui/button";
import { TeamCard } from "./TeamCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamListProps {
  leagueTeams: Team[];
  isLoading: boolean;
  leagueId: string; // Add leagueId prop
  onDeleteTeam: (teamId: string, teamName: string) => Promise<boolean>;
}

export default function TeamList({
  leagueTeams,
  isLoading,
  leagueId, // Use leagueId prop
  onDeleteTeam,
}: TeamListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teams in League</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg space-y-2 animate-pulse"
              >
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams in League</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leagueTeams.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No teams in this league yet
            </div>
          ) : (
            leagueTeams.map((team) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                leagueId={leagueId} // Pass leagueId to TeamCard
                onDeleteTeam={onDeleteTeam} 
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}