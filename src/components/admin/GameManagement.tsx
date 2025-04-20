"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, Calendar, Edit, Trash2, CheckCircle, XCircle, AlarmPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import GameScheduleForm from "./GameScheduleForm";

interface Team {
  id: string;
  _id?: string;
  name: string;
  players: any[];
}

interface Match {
  id: string;
  _id?: string;
  league: string;
  teamA: {
    id: string;
    _id?: string;
    name: string;
  };
  teamB: {
    id: string;
    _id?: string;
    name: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  status: string;
  result?: {
    teamAScore: number[];
    teamBScore: number[];
    winner: string;
  };
}

interface GameManagementProps {
  leagueId: string;
  matches: Match[];
  isAdmin: boolean;
  onMatchUpdated: () => void;
}

export default function GameManagement({
  leagueId,
  matches,
  isAdmin,
  onMatchUpdated
}: GameManagementProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const deleteMatch = async (matchId: string) => {
    if (!isAdmin) return;
    
    if (confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      try {
        setIsDeleting(matchId);
        
        const response = await fetch(`/api/matches/${matchId}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete game");
        }
        
        toast.success("Game deleted successfully");
        onMatchUpdated();
      } catch (error) {
        console.error("Error deleting game:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete game");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const openScheduleDialog = (match: Match) => {
    setSelectedMatch(match);
    setScheduleDialogOpen(true);
  };

  const handleScheduled = () => {
    setScheduleDialogOpen(false);
    setSelectedMatch(null);
    onMatchUpdated();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unscheduled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unscheduled</span>;
      case "scheduled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>;
      case "in_progress":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Progress</span>;
      case "completed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case "canceled":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Canceled</span>;
      case "postponed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Postponed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  // Filter matches into scheduled and unscheduled
  const unscheduledMatches = matches.filter(match => match.status === 'unscheduled');
  const scheduledMatches = matches.filter(match => match.status !== 'unscheduled');

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Games</CardTitle>
          <CardDescription>
            No games have been created for this league yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground mb-4">Create games to start scheduling matches for this league</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>League Games</CardTitle>
          <CardDescription>
            Manage games for this league
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unscheduledMatches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Unscheduled Games</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teams</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unscheduledMatches.map(match => (
                    <TableRow key={match.id || match._id}>
                      <TableCell className="font-medium">
                        {match.teamA.name} vs {match.teamB.name}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openScheduleDialog(match)}
                        >
                          <AlarmPlus className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMatch(match.id || match._id || "")}
                          disabled={!!isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {scheduledMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4">Scheduled Games</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teams</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledMatches.map(match => (
                    <TableRow key={match.id || match._id}>
                      <TableCell className="font-medium">
                        {match.teamA.name} vs {match.teamB.name}
                      </TableCell>
                      <TableCell>{formatDate(match.scheduledDate)}</TableCell>
                      <TableCell>{match.scheduledTime || "—"}</TableCell>
                      <TableCell>{match.location || "—"}</TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openScheduleDialog(match)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMatch(match.id || match._id || "")}
                          disabled={!!isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game scheduling dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Game</DialogTitle>
            <DialogDescription>
              Set the date, time, and location for this game.
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <GameScheduleForm 
              match={selectedMatch} 
              onScheduled={handleScheduled} 
              onCancel={() => setScheduleDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
