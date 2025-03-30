"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trophy, Medal } from "lucide-react";
import { toast } from "sonner";

interface Ranking {
  id: string;
  league: string;
  team: {
    id: string;
    name: string;
    players: any[];
  };
  rank: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
  lastUpdated: string;
}

interface League {
  id: string;
  name: string;
  status: string;
}

function RankingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchLeagues() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch active leagues
        const leaguesResponse = await fetch('/api/leagues?active=true');
        const leaguesData = await leaguesResponse.json();
        
        if (leaguesData.leagues && leaguesData.leagues.length > 0) {
          setActiveLeagues(leaguesData.leagues);
          setSelectedLeagueId(leaguesData.leagues[0].id);
        }
        
        // Get player and team info
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        const playerData = await playerResponse.json();
        
        if (playerData.players && playerData.players.length > 0) {
          const playerId = playerData.players[0].id;
          
          // Get teams for this player
          const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
          const teamsData = await teamsResponse.json();
          
          if (teamsData.teams) {
            const teamIds = teamsData.teams.map((team: any) => team.id);
            setMyTeamIds(teamIds);
          }
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
        toast.error("Failed to load leagues");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagues();
  }, [session]);
  
  useEffect(() => {
    async function fetchRankings() {
      if (!selectedLeagueId) return;
      
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/leagues/${selectedLeagueId}/rankings`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setRankings(data);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
        toast.error("Failed to load rankings");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRankings();
  }, [selectedLeagueId]);
  
  function getRankBadge(rank: number) {
    if (rank === 1) {
      return (
        <div className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
          <Trophy className="w-3 h-3" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="bg-zinc-400 text-white w-6 h-6 rounded-full flex items-center justify-center">
          <Medal className="w-3 h-3" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="bg-amber-700 text-white w-6 h-6 rounded-full flex items-center justify-center">
          <Medal className="w-3 h-3" />
        </div>
      );
    } else {
      return (
        <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center text-sm">
          {rank}
        </div>
      );
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">League Rankings</h1>
      
      {activeLeagues.length > 0 ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select a League</CardTitle>
              <CardDescription>
                View the current rankings for any active league.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-64">
                  <Label htmlFor="league" className="mb-2 block">League</Label>
                  <Select
                    value={selectedLeagueId}
                    onValueChange={setSelectedLeagueId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="league">
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeLeagues.map(league => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedLeagueId && activeLeagues.find(l => l.id === selectedLeagueId)?.status === 'active'
                      ? "This league is currently active with ongoing matches."
                      : "This league is in registration phase."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-pulse text-muted-foreground">Loading rankings...</div>
            </div>
          ) : rankings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Standings</CardTitle>
                <CardDescription>
                  Rankings are updated automatically after each match result is submitted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Rank</th>
                        <th className="text-left py-3 px-4">Team</th>
                        <th className="text-center py-3 px-4">P</th>
                        <th className="text-center py-3 px-4">W</th>
                        <th className="text-center py-3 px-4">L</th>
                        <th className="text-center py-3 px-4">Sets</th>
                        <th className="text-center py-3 px-4">Games</th>
                        <th className="text-center py-3 px-4">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((ranking) => {
                        const isMyTeam = myTeamIds.includes(ranking.team.id);
                        return (
                          <tr 
                            key={ranking.id} 
                            className={`border-b ${isMyTeam ? 'bg-primary/5' : ''}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getRankBadge(ranking.rank)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {ranking.team.name} 
                                {isMyTeam && <span className="ml-2 text-xs text-primary">(Your Team)</span>}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {ranking.team.players.map((p: any) => p.nickname).join(' & ')}
                              </div>
                            </td>
                            <td className="text-center py-3 px-4">{ranking.matchesPlayed}</td>
                            <td className="text-center py-3 px-4">{ranking.matchesWon}</td>
                            <td className="text-center py-3 px-4">{ranking.matchesLost}</td>
                            <td className="text-center py-3 px-4">
                              {ranking.setsWon}-{ranking.setsLost}
                            </td>
                            <td className="text-center py-3 px-4">
                              {ranking.gamesWon}-{ranking.gamesLost}
                            </td>
                            <td className="text-center py-3 px-4 font-bold">{ranking.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>P: Played, W: Won, L: Lost</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Rankings Available</h3>
                <p className="text-muted-foreground mb-6">
                  This league doesn't have any rankings yet. Rankings are generated after matches are played.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Active Leagues</h3>
            <p className="text-muted-foreground mb-6">
              There are no active leagues to display rankings for.
            </p>
            <Button asChild>
              <Link href="/dashboard/leagues">
                Browse Leagues
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default withAuth(RankingsPage);
