"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Users, Trash, User } from "lucide-react";
import { useState } from "react";
import { Team } from "@/hooks/useLeagueData";

interface TeamListProps {
  leagueTeams: Team[];
  isLoading: boolean;
  onDeleteTeam: (teamId: string, teamName: string) => Promise<boolean>;
}

export default function TeamList({
  leagueTeams,
  isLoading,
  onDeleteTeam,
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
                Teams in This League
              </CardTitle>
              <CardDescription>
                {leagueTeams.length} team
                {leagueTeams.length !== 1 ? "s" : ""} registered
                {leagueTeams.length > 0
                  ? ` (${totalPlayers} players total)`
                  : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className="p-0 overflow-y-auto"
          style={{ maxHeight: "500px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : leagueTeams.length > 0 ? (
            <div className="divide-y">
              {leagueTeams.map((team) => (
                <div key={team.id} className="px-3 py-2 hover:bg-muted/30">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{team.name}</span>
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          {team.players.length} player
                          {team.players.length !== 1 ? "s" : ""}
                        </Badge>
                        <span className="mx-0.5 text-muted-foreground">
                          |
                        </span>
                        {team.players.map((player) => (
                          <div
                            key={player.id}
                            className="inline-flex items-center text-xs"
                          >
                            <User className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{player.nickname}</span>
                            <span className="ml-1 text-muted-foreground">
                              ({player.skillLevel})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteTeam(team)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete team</span>
                    </Button>
                  </div>
                </div>
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
