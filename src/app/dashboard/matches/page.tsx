"use client";

import { useState, useEffect } from "react";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ArrowRight, CheckCircle2, PauseCircle } from "lucide-react";
import { toast } from "sonner";
import { format, isSameDay, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Match {
  id: string;
  league: {
    id: string;
    name: string;
    status: string;
  };
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
  submittedBy?: {
    id: string;
    name: string;
  };
  confirmedBy?: {
    id: string;
    name: string;
  };
}

function MatchesPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchMatches() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        // First get player and team info to filter matches
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        const playerData = await playerResponse.json();
        
        const teamIds: string[] = [];
        
        if (playerData.players && playerData.players.length > 0) {
          const playerId = playerData.players[0].id;
          
          // Get teams for this player
          const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
          const teamsData = await teamsResponse.json();
          
          if (teamsData.teams && teamsData.teams.length > 0) {
            teamsData.teams.forEach((team: any) => {
              teamIds.push(team.id);
            });
            setMyTeamIds(teamIds);
            
            // Fetch upcoming matches (scheduled and in_progress)
            const upcomingResponse = await fetch(
              `/api/matches?status=scheduled,in_progress&startDate=${new Date().toISOString()}`
            );
            const upcomingData = await upcomingResponse.json();
            
            if (upcomingData.matches) {
              // Filter to only include matches where user's teams are participating
              const filteredUpcoming = upcomingData.matches.filter((match: Match) => {
                return (
                  teamIds.includes(match.teamA.id) ||
                  teamIds.includes(match.teamB.id)
                );
              });
              setUpcomingMatches(filteredUpcoming);
            }
            
            // Fetch past matches (completed)
            const pastResponse = await fetch(
              `/api/matches?status=completed&endDate=${new Date().toISOString()}`
            );
            const pastData = await pastResponse.json();
            
            if (pastData.matches) {
              // Filter to only include matches where user's teams are participating
              const filteredPast = pastData.matches.filter((match: Match) => {
                return (
                  teamIds.includes(match.teamA.id) ||
                  teamIds.includes(match.teamB.id)
                );
              });
              setPastMatches(filteredPast);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast.error("Failed to load matches");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMatches();
  }, [session]);
  
  function MatchCard({ match }: { match: Match }) {
    const date = parseISO(match.scheduledDate);
    const isToday = isSameDay(date, new Date());
    const isUserTeamA = myTeamIds.includes(match.teamA.id);
    const isUserTeamB = myTeamIds.includes(match.teamB.id);
    const userTeam = isUserTeamA ? match.teamA : match.teamB;
    const opponentTeam = isUserTeamA ? match.teamB : match.teamA;
    
    const getStatusBadge = () => {
      switch (match.status) {
        case 'scheduled':
          return (
            <Badge variant="outline" className="ml-2">
              Scheduled
            </Badge>
          );
        case 'in_progress':
          return (
            <Badge variant="default" className="bg-blue-500 ml-2">
              In Progress
            </Badge>
          );
        case 'completed':
          return (
            <Badge variant="default" className="bg-green-500 ml-2">
              Completed
            </Badge>
          );
        case 'canceled':
          return (
            <Badge variant="default" className="bg-red-500 ml-2">
              Canceled
            </Badge>
          );
        case 'postponed':
          return (
            <Badge variant="default" className="bg-yellow-500 ml-2">
              Postponed
            </Badge>
          );
        default:
          return null;
      }
    };
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Link href={`/dashboard/leagues/${match.league.id}`} className="hover:underline">
              {match.league.name}
            </Link>
            {getStatusBadge()}
          </CardTitle>
          <CardDescription>
            {isToday ? "Today" : format(date, "EEEE, MMMM d, yyyy")}
            {match.scheduledTime && ` at ${match.scheduledTime}`}
            {match.location && ` • ${match.location}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-between py-2">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <div className="font-medium">{userTeam.name}</div>
              <div className="text-xs text-muted-foreground">Your Team</div>
            </div>
            
            <div className="flex items-center">
              {match.status === 'completed' && match.result ? (
                <div className="flex items-center justify-center text-lg font-bold">
                  <span className={match.result.winner === userTeam.id ? "text-green-600" : "text-muted-foreground"}>
                    {isUserTeamA ? match.result.teamAScore.join('-') : match.result.teamBScore.join('-')}
                  </span>
                  <span className="mx-2 text-muted-foreground">vs</span>
                  <span className={match.result.winner === opponentTeam.id ? "text-red-600" : "text-muted-foreground"}>
                    {isUserTeamA ? match.result.teamBScore.join('-') : match.result.teamAScore.join('-')}
                  </span>
                </div>
              ) : (
                <ArrowRight className="w-5 h-5 text-muted-foreground mx-2" />
              )}
            </div>
            
            <div className="text-center sm:text-right">
              <div className="font-medium">{opponentTeam.name}</div>
              <div className="text-xs text-muted-foreground">Opponent</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/matches/${match.id}`}>
              View Details
            </Link>
          </Button>
          
          {match.status === 'scheduled' && (
            <Button
              size="sm"
              asChild
            >
              <Link href={`/dashboard/matches/${match.id}/report`}>
                Report Result
              </Link>
            </Button>
          )}
          
          {match.status === 'completed' && (
            <div className="flex items-center text-sm text-muted-foreground">
              {match.result?.winner === userTeam.id ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Win
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <PauseCircle className="w-4 h-4 mr-1" />
                  Loss
                </span>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Matches</h1>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          <TabsTrigger value="past">Past Matches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-pulse text-muted-foreground">Loading matches...</div>
            </div>
          ) : upcomingMatches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Upcoming Matches</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any scheduled matches coming up.
                </p>
                <Button asChild>
                  <Link href="/dashboard/leagues">
                    Find a League to Join
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-pulse text-muted-foreground">Loading matches...</div>
            </div>
          ) : pastMatches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {pastMatches.map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Match History</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any completed matches yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAuth(MatchesPage);
