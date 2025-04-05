"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { toast } from "sonner";
import withAuth from "@/components/auth/withAuth";

interface League {
  id: string;
  _id: string;
  name: string;
  status: string;
}

interface Team {
  id: string;
  _id: string;
  name: string;
}

interface Ranking {
  id: string;
  _id: string;
  team: {
    id: string;
    _id: string;
    name: string;
    players: any[];
  };
  league: string;
  rank: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
}

function MyRankingsPage() {
  const { data: session } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(true);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch player's leagues
  useEffect(() => {
    const fetchLeagues = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingLeagues(true);
        
        // Get active leagues that the player is part of
        const response = await fetch('/api/players/leagues?active=true');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch leagues: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.leagues && data.leagues.length > 0) {
          // Process leagues to ensure IDs are normalized
          const processedLeagues = data.leagues.map((league: any) => ({
            ...league,
            id: league._id || league.id
          }));
          
          setLeagues(processedLeagues);
          
          // Set the first league as default selection
          setSelectedLeagueId(processedLeagues[0].id);
        }

        // Fetch the player's teams
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        if (!playerResponse.ok) {
          throw new Error(`Failed to fetch player: ${playerResponse.statusText}`);
        }
        const playerData = await playerResponse.json();

        if (playerData.players && playerData.players.length > 0) {
          const playerId = playerData.players[0].id || playerData.players[0]._id;
          
          // Fetch teams for this player
          const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
          if (!teamsResponse.ok) {
            throw new Error(`Failed to fetch teams: ${teamsResponse.statusText}`);
          }
          const teamsData = await teamsResponse.json();

          if (teamsData.teams) {
            // Ensure each team has an id property
            const processedTeams = teamsData.teams.map((team: any) => ({
              ...team,
              id: team._id || team.id
            }));
            setMyTeams(processedTeams);
          }
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
        setError("Failed to load your leagues");
        toast.error("Failed to load your leagues");
      } finally {
        setIsLoadingLeagues(false);
      }
    };

    fetchLeagues();
  }, [session]);

  // Fetch rankings for selected league
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedLeagueId) return;

      try {
        setIsLoadingRankings(true);
        
        const response = await fetch(`/api/leagues/${selectedLeagueId}/rankings`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rankings: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.rankings) {
          // Process rankings to ensure IDs are normalized
          const processedRankings = data.rankings.map((ranking: any) => ({
            ...ranking,
            id: ranking._id || ranking.id,
            team: {
              ...ranking.team,
              id: ranking.team._id || ranking.team.id
            }
          }));
          
          setRankings(processedRankings);
        } else {
          setRankings([]);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
        setError("Failed to load rankings");
        toast.error("Failed to load rankings");
      } finally {
        setIsLoadingRankings(false);
      }
    };

    if (selectedLeagueId) {
      fetchRankings();
    }
  }, [selectedLeagueId]);

  const isMyTeam = (teamId: string) => {
    return myTeams.some(team => team.id === teamId);
  };

  // Function to render rank with medal for top 3
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center">
          <Medal className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center">
          <Medal className="h-5 w-5 text-gray-400 mr-1" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center">
          <Medal className="h-5 w-5 text-amber-700 mr-1" />
          <span className="font-bold">{rank}</span>
        </div>
      );
    }
    
    return <span>{rank}</span>;
  };

  if (isLoadingLeagues) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="h-4 bg-muted rounded max-w-md mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded max-w-sm mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Rankings</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Leagues Found</h2>
          <p className="text-muted-foreground mb-6">
            You're not currently part of any active leagues.
          </p>
          <Button asChild>
            <Link href="/dashboard/my-leagues">
              <Award className="w-4 h-4 mr-2" />
              View My Leagues
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Rankings</h1>
          <p className="text-muted-foreground">
            Check your team's position in the league standings
          </p>
        </div>
        
        <div className="w-full md:w-auto">
          <Select
            value={selectedLeagueId}
            onValueChange={setSelectedLeagueId}
            disabled={isLoadingRankings}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select a league" />
            </SelectTrigger>
            <SelectContent>
              {leagues.map((league) => (
                <SelectItem key={league.id} value={league.id}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Rankings
            {leagues.find(l => l.id === selectedLeagueId)?.name && (
              <span className="ml-2 text-muted-foreground font-normal">
                {leagues.find(l => l.id === selectedLeagueId)?.name}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Current team standings based on match results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRankings ? (
            <div className="animate-pulse py-8 text-center">
              <div className="h-4 bg-muted rounded max-w-md mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded max-w-sm mx-auto"></div>
            </div>
          ) : rankings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Played</TableHead>
                    <TableHead className="text-center">Won</TableHead>
                    <TableHead className="text-center">Lost</TableHead>
                    <TableHead className="text-center">Sets W-L</TableHead>
                    <TableHead className="text-center">Games W-L</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((ranking) => {
                    const isCurrentUserTeam = isMyTeam(ranking.team.id);
                    
                    return (
                      <TableRow 
                        key={ranking.id}
                        className={isCurrentUserTeam ? "bg-primary/5 font-medium" : ""}
                      >
                        <TableCell className="text-center">
                          {renderRank(ranking.rank)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {ranking.team.name}
                            {isCurrentUserTeam && (
                              <Badge className="ml-2" variant="outline">
                                Your Team
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{ranking.matchesPlayed}</TableCell>
                        <TableCell className="text-center">{ranking.matchesWon}</TableCell>
                        <TableCell className="text-center">{ranking.matchesLost}</TableCell>
                        <TableCell className="text-center">{ranking.setsWon}-{ranking.setsLost}</TableCell>
                        <TableCell className="text-center">{ranking.gamesWon}-{ranking.gamesLost}</TableCell>
                        <TableCell className="text-center font-bold">{ranking.points}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Rankings Available</h3>
              <p className="text-muted-foreground">
                Rankings will be generated once matches have been played in this league.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(MyRankingsPage);
