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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
}

interface Ranking {
  id: string;
  team: Team;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon?: number;
  setsLost?: number;
  position?: number;
  previousPosition?: number;
}

interface LeagueRankingsTableProps {
  leagueId: string;
  title?: string;
  description?: string;
}

export default function LeagueRankingsTable({
  leagueId,
  title = "League Standings",
  description = "Current rankings and statistics for all teams in the league"
}: LeagueRankingsTableProps) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRankings() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/rankings`);

        if (!response.ok) {
          throw new Error(`Error fetching rankings: ${response.statusText}`);
        }

        const data = await response.json();

        // Make sure we have the expected structure
        if (!Array.isArray(data)) {
          throw new Error("Invalid rankings data format");
        }

        // Process and sort the rankings
        const processedRankings = data.map((ranking, index) => ({
          ...ranking,
          id: ranking._id || ranking.id,
          position: index + 1,
          team: {
            ...ranking.team,
            id: ranking.team._id || ranking.team.id
          }
        }));

        setRankings(processedRankings);
      } catch (error) {
        console.error("Error fetching rankings:", error);
        setError(error instanceof Error ? error.message : "Failed to load rankings");
        toast.error("Failed to load rankings");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, [leagueId]);

  // Render position change indicator
  const renderPositionChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null;

    if (current < previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current > previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Generate position badge with appropriate styling
  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">1st</Badge>;
    } else if (position === 2) {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">2nd</Badge>;
    } else if (position === 3) {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">3rd</Badge>;
    }
    return <Badge variant="outline">{position}th</Badge>;
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
            Error Loading Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No rankings data available yet.</p>
            <p className="text-sm mt-2">Rankings will appear after matches have been played.</p>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Played</TableHead>
                <TableHead className="text-center">Won</TableHead>
                <TableHead className="text-center">Lost</TableHead>
                {rankings.some(r => r.setsWon !== undefined) && (
                  <TableHead className="text-center">Sets</TableHead>
                )}
                <TableHead className="text-center">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((ranking) => (
                <TableRow key={ranking.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-1">
                      {getPositionBadge(ranking.position || 0)}
                      <span className="ml-1">
                        {renderPositionChange(ranking.position, ranking.previousPosition)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{ranking.team.name}</TableCell>
                  <TableCell className="text-center">{ranking.matchesPlayed}</TableCell>
                  <TableCell className="text-center font-medium">{ranking.wins}</TableCell>
                  <TableCell className="text-center">{ranking.losses}</TableCell>
                  {rankings.some(r => r.setsWon !== undefined) && (
                    <TableCell className="text-center">
                      {ranking.setsWon !== undefined && ranking.setsLost !== undefined
                        ? `${ranking.setsWon}-${ranking.setsLost}`
                        : "-"}
                    </TableCell>
                  )}
                  <TableCell className="text-center font-bold">{ranking.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
