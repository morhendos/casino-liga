"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Trophy, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
}

interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  scheduledDate: string;
  scheduledTime?: string;
  location?: string;
  status: string;
  result?: {
    teamAScore: number[];
    teamBScore: number[];
    winner: string;
  };
}

interface MatchHistoryListProps {
  leagueId: string;
  title?: string;
  description?: string;
  teamFilter?: string;
  showAllOption?: boolean;
  limit?: number;
  showViewAllButton?: boolean;
}

export default function MatchHistoryList({
  leagueId,
  title = "Match History",
  description = "Past and upcoming matches in this league",
  teamFilter,
  showAllOption = true,
  limit,
  showViewAllButton = false
}: MatchHistoryListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>(teamFilter || "all");
  const [teams, setTeams] = useState<Team[]>([]);

  // Fetch matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/matches`);

        if (!response.ok) {
          throw new Error(`Error fetching matches: ${response.statusText}`);
        }

        const data = await response.json();

        // Process matches
        const processedMatches = data.map((match: any) => ({
          ...match,
          id: match._id || match.id,
          teamA: {
            ...match.teamA,
            id: match.teamA._id || match.teamA.id
          },
          teamB: {
            ...match.teamB,
            id: match.teamB._id || match.teamB.id
          }
        }));

        setMatches(processedMatches);

        // Extract teams from matches for filtering
        const teamSet = new Set<string>();
        const teamsFromMatches: Team[] = [];

        processedMatches.forEach((match: Match) => {
          if (!teamSet.has(match.teamA.id)) {
            teamSet.add(match.teamA.id);
            teamsFromMatches.push(match.teamA);
          }
          if (!teamSet.has(match.teamB.id)) {
            teamSet.add(match.teamB.id);
            teamsFromMatches.push(match.teamB);
          }
        });

        setTeams(teamsFromMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError(error instanceof Error ? error.message : "Failed to load matches");
        toast.error("Failed to load match history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [leagueId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...matches];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(match => match.status === filterStatus);
    }

    // Filter by team
    if (filterTeam !== "all") {
      filtered = filtered.filter(
        match => match.teamA.id === filterTeam || match.teamB.id === filterTeam
      );
    }

    // Sort matches: completed matches first (by date desc), then scheduled (by date asc)
    filtered.sort((a, b) => {
      // Group by status first
      const statusOrder = {
        completed: 0,
        scheduled: 1,
        in_progress: 2,
        postponed: 3,
        canceled: 4
      };

      const statusA = statusOrder[a.status as keyof typeof statusOrder] || 99;
      const statusB = statusOrder[b.status as keyof typeof statusOrder] || 99;

      if (statusA !== statusB) return statusA - statusB;

      // Then sort by date
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();

      if (a.status === 'completed') {
        // For completed matches, sort by most recent first
        return dateB - dateA;
      } else {
        // For upcoming matches, sort by soonest first
        return dateA - dateB;
      }
    });

    // Apply limit if specified
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredMatches(filtered);
  }, [matches, filterStatus, filterTeam, limit]);

  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'postponed':
        return <Badge variant="secondary">Postponed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            Error Loading Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No matches available for this league yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showAllOption && (
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Team</label>
              <Select
                value={filterTeam}
                onValueChange={setFilterTeam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No matches found for the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => (
                  <TableRow key={match.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{formatDate(match.scheduledDate)}</span>
                        <span className="text-xs text-muted-foreground">
                          {match.scheduledTime || 'Time TBD'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={match.result?.winner === match.teamA.id ? "font-bold" : ""}>
                          {match.teamA.name}
                        </span>
                        <span>vs</span>
                        <span className={match.result?.winner === match.teamB.id ? "font-bold" : ""}>
                          {match.teamB.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(match.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {match.status === 'completed' && match.result ? (
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium">
                            {match.result.teamAScore.join('-')} / {match.result.teamBScore.join('-')}
                          </div>
                          <div className="flex items-center text-xs text-green-600 mt-1">
                            <Trophy className="h-3 w-3 mr-1" />
                            {match.result.winner === match.teamA.id ? match.teamA.name : match.teamB.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/matches/${match.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {showViewAllButton && filteredMatches.length > 0 && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/leagues/${leagueId}/matches`}>
              <Calendar className="w-4 h-4 mr-2" />
              View All Matches
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
