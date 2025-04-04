"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface League {
  id: string;
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  minTeams: number;
  teams: Team[];
  matchFormat: string;
  venue?: string;
  status: string;
  banner?: string;
  scheduleGenerated: boolean;
  pointsPerWin: number;
  pointsPerLoss: number;
  organizer: any;
}

interface Team {
  id: string;
  _id: string;
  name: string;
  players: Player[];
}

interface Player {
  id: string;
  _id: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  profileImage?: string;
}

function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract the ID from params
  const leagueId = params?.id as string;

  useEffect(() => {
    if (!leagueId || leagueId === "undefined") {
      setError("Invalid league ID");
      setIsLoading(false);
      return;
    }

    async function fetchLeagueDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const leagueData = await response.json();
        console.log("League data:", leagueData);
        
        // Ensure ID is available in the expected format
        const processedLeague = {
          ...leagueData,
          id: leagueData._id || leagueData.id,
          teams: leagueData.teams?.map((team: any) => ({
            ...team,
            id: team._id || team.id,
            players: team.players?.map((player: any) => ({
              ...player,
              id: player._id || player.id
            }))
          })) || []
        };
        
        setLeague(processedLeague);
      } catch (error) {
        console.error("Error fetching league details:", error);
        setError("Failed to load league details");
        toast.error("Failed to load league details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagueDetails();
  }, [leagueId]);
  
  function formatMatchType(matchFormat: string): string {
    switch (matchFormat) {
      case 'bestOf3':
        return 'Best of 3 Sets';
      case 'bestOf5':
        return 'Best of 5 Sets';
      case 'singleSet':
        return 'Single Set';
      default:
        return matchFormat;
    }
  }

  if (isLoading) {
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
  
  if (error || !league) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "Could not load league details"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/leagues')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leagues
            </Button>
          </CardFooter>
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
          <Link href="/dashboard/leagues">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <Badge className="ml-4" variant={
          league.status === 'active' ? "default" :
          league.status === 'registration' ? "secondary" :
          league.status === 'completed' ? "outline" :
          "destructive"
        }>
          {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>League Details</CardTitle>
              <CardDescription>
                {league.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Format</div>
                    <div>{formatMatchType(league.matchFormat)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Venue</div>
                    <div>{league.venue || "Not specified"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Start Date</div>
                    <div>{new Date(league.startDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">End Date</div>
                    <div>{new Date(league.endDate).toLocaleDateString()}</div>
                  </div>
                  {league.status === 'registration' && (
                    <div>
                      <div className="text-sm text-muted-foreground">Registration Deadline</div>
                      <div>{new Date(league.registrationDeadline).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Teams</div>
                    <div>{league.teams.length} / {league.maxTeams}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Points System</div>
                    <div>Win: {league.pointsPerWin} / Loss: {league.pointsPerLoss}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Organizer</div>
                    <div>{league.organizer?.name || "Unknown"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/leagues/${league.id}/schedule`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/leagues/${league.id}/rankings`}>
                  <Trophy className="w-4 h-4 mr-2" />
                  View Rankings
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Additional sections can be added here */}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                {league.teams.length} of {league.maxTeams} teams registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {league.teams.length > 0 ? (
                <div className="space-y-4">
                  {league.teams.map((team) => (
                    <div 
                      key={team.id || team._id} 
                      className="flex items-center p-3 rounded-md border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.players?.map(player => player.nickname).join(' & ')}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/teams/${team.id || team._id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No teams have joined this league yet.</p>
                </div>
              )}
            </CardContent>
            {league.status === 'registration' && (
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/leagues/${league.id}/join`}>
                    Join League
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(LeagueDetailsPage);