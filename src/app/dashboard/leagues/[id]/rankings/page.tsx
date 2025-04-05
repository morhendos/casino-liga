"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Ranking {
  id: string;
  _id: string;
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
}

interface League {
  id: string;
  _id: string;
  name: string;
  teams: any[];
  status: string;
}

function LeagueRankingsPage() {
  const params = useParams();
  const router = useRouter();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract the ID from params
  const leagueId = params?.id as string;

  useEffect(() => {
    async function fetchLeagueDetails() {
      if (!leagueId || leagueId === "undefined") {
        setError("Invalid league ID");
        setIsLoadingLeague(false);
        return;
      }
      
      try {
        setIsLoadingLeague(true);
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const leagueData = await response.json();
        
        // Ensure ID is available in the expected format
        const processedLeague = {
          ...leagueData,
          id: leagueData._id || leagueData.id,
          teams: leagueData.teams?.map((team: any) => ({
            ...team,
            id: team._id || team.id
          })) || []
        };
        
        setLeague(processedLeague);
      } catch (error) {
        console.error("Error fetching league details:", error);
        setError("Failed to load league details");
        toast.error("Failed to load league details");
      } finally {
        setIsLoadingLeague(false);
      }
    }
    
    fetchLeagueDetails();
  }, [leagueId]);

  useEffect(() => {
    async function fetchRankings() {
      if (!leagueId || leagueId === "undefined") {
        setError("Invalid league ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/rankings`);
        
        if (!response.ok) {
          throw new Error(`Error fetching rankings: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.rankings) {
          // Ensure each ranking has an id property and team has an id property
          const processedRankings = data.rankings.map((ranking: any) => ({
            ...ranking,
            id: ranking._id || ranking.id,
            team: {
              ...ranking.team,
              id: ranking.team._id || ranking.team.id
            }
          }));
          
          // Sort rankings by rank or points
          const sortedRankings = processedRankings.sort((a: Ranking, b: Ranking) => a.rank - b.rank);
          
          setRankings(sortedRankings);
        } else {
          setRankings([]);
        }
      } catch (error) {
        console.error("Error fetching rankings:", error);
        setError("Failed to load rankings");
        toast.error("Failed to load rankings");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRankings();
  }, [leagueId]);

  if (isLoading || isLoadingLeague) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse text-center">
          <h2 className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></h2>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded w-full max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/leagues')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leagues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-4"
          asChild
        >
          <Link href={`/dashboard/leagues/${leagueId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to League
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {league?.name} - Rankings
        </h1>
      </div>
      
      {league?.teams.length === 0 ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>No Teams</CardTitle>
            <CardDescription>
              This league doesn't have any teams yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : rankings.length === 0 ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>No Rankings Available</CardTitle>
            <CardDescription>
              Rankings will be available once matches have been played.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Current Standings</CardTitle>
            <CardDescription>
              Updated rankings based on match results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-2">Team</th>
                    <th className="text-center py-3 px-2">Played</th>
                    <th className="text-center py-3 px-2">Won</th>
                    <th className="text-center py-3 px-2">Lost</th>
                    <th className="text-center py-3 px-2">Sets W-L</th>
                    <th className="text-center py-3 px-2">Games W-L</th>
                    <th className="text-center py-3 px-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking) => (
                    <tr key={ranking.id} className="border-b hover:bg-muted/50">
                      <td className="py-4 px-2 font-medium">{ranking.rank}</td>
                      <td className="py-4 px-2">
                        <Link 
                          href={`/dashboard/teams/${ranking.team.id}`}
                          className="hover:underline font-medium"
                        >
                          {ranking.team.name}
                        </Link>
                      </td>
                      <td className="py-4 px-2 text-center">{ranking.matchesPlayed}</td>
                      <td className="py-4 px-2 text-center">{ranking.matchesWon}</td>
                      <td className="py-4 px-2 text-center">{ranking.matchesLost}</td>
                      <td className="py-4 px-2 text-center">
                        {ranking.setsWon}-{ranking.setsLost}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {ranking.gamesWon}-{ranking.gamesLost}
                      </td>
                      <td className="py-4 px-2 text-center font-bold">{ranking.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default withAuth(LeagueRankingsPage);