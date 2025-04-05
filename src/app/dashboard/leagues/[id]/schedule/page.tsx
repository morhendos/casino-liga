"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Match {
  id: string;
  _id: string;
  league: string;
  teamA: {
    id: string;
    name: string;
    players: any[];
  };
  teamB: {
    id: string;
    name: string;
    players: any[];
  };
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

interface League {
  id: string;
  _id: string;
  name: string;
  scheduleGenerated: boolean;
  status: string;
  organizer: any;
}

function LeagueSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
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
          id: leagueData._id || leagueData.id
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
    async function fetchSchedule() {
      if (!leagueId || leagueId === "undefined") {
        setError("Invalid league ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}/schedule`);
        
        if (!response.ok) {
          throw new Error(`Error fetching schedule: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.matches) {
          // Ensure each match has an id property
          const processedMatches = data.matches.map((match: any) => ({
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
        } else {
          setMatches([]);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setError("Failed to load schedule");
        toast.error("Failed to load schedule");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSchedule();
  }, [leagueId]);

  // Group matches by scheduled date
  const matchesByDate: Record<string, Match[]> = {};
  matches.forEach(match => {
    const date = new Date(match.scheduledDate).toLocaleDateString();
    if (!matchesByDate[date]) {
      matchesByDate[date] = [];
    }
    matchesByDate[date].push(match);
  });

  // Sort dates
  const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

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
          {league?.name} - Schedule
        </h1>
      </div>
      
      {!league?.scheduleGenerated ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>No Schedule Generated</CardTitle>
            <CardDescription>
              This league doesn't have a schedule yet.
            </CardDescription>
          </CardHeader>
          {league?.organizer?.id === "user_id_here" && (
            <CardContent className="pt-4">
              <Button>
                Generate Schedule
              </Button>
            </CardContent>
          )}
        </Card>
      ) : matches.length === 0 ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>No Matches Scheduled</CardTitle>
            <CardDescription>
              There are no matches scheduled for this league yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(date => (
            <Card key={date} className="overflow-hidden">
              <CardHeader className="bg-muted">
                <CardTitle className="text-xl">
                  {new Date(date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {matchesByDate[date].map((match) => (
                    <div 
                      key={match.id || match._id} 
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{match.teamA.name}</div>
                        </div>
                        
                        <div className="px-4 text-center">
                          {match.status === 'completed' && match.result ? (
                            <div className="font-bold">
                              {match.result.teamAScore.join('-')} vs {match.result.teamBScore.join('-')}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              {match.scheduledTime || 'TBD'}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground uppercase mt-1">
                            {match.status === 'scheduled' && 'Upcoming'}
                            {match.status === 'in_progress' && 'In Progress'}
                            {match.status === 'completed' && 'Final'}
                            {match.status === 'canceled' && 'Canceled'}
                            {match.status === 'postponed' && 'Postponed'}
                          </div>
                        </div>
                        
                        <div className="flex-1 text-right">
                          <div className="font-medium">{match.teamB.name}</div>
                        </div>
                      </div>
                      
                      {match.location && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Location: {match.location}
                        </div>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                        >
                          <Link href={`/dashboard/matches/${match.id || match._id}`}>
                            Match Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(LeagueSchedulePage);