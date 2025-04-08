"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Loader2, Users } from "lucide-react";
import { useState } from "react";
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
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setDeleteTeamDialogOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      setIsDeletingTeam(true);
      const success = await onDeleteTeam(teamToDelete.id, teamToDelete.name);
      
      if (success) {
        setDeleteTeamDialogOpen(false);
        setTeamToDelete(null);
      }
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const totalPlayers = leagueTeams.reduce(
    (count, team) => count + team.players.length,
    0
  );

  // Generate default subtitle if one is not provided
  const defaultSubtitle = subtitle || 
    `${leagueTeams.length} team${leagueTeams.length !== 1 ? "s" : ""} registered${
      leagueTeams.length > 0 ? ` (${totalPlayers} players total)` : ""
    }`;

  return (
    <>
      {/* Delete Team Confirmation Dialog */}
      <AlertDialog
        open={deleteTeamDialogOpen}
        onOpenChange={setDeleteTeamDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this team?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {teamToDelete && (
                <>
                  Team "{teamToDelete.name}" with {teamToDelete.players.length}{" "}
                  player(s) will be removed from the league. This action cannot
                  be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTeam}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTeam}
              disabled={isDeletingTeam}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingTeam ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Team"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
}
