"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import withAuth from "@/components/auth/withAuth";
import { isAdmin } from "@/lib/auth/role-utils";

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
  teams: any[];
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
  name: string;
  players?: any[];
}

function LeaguesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [pastLeagues, setPastLeagues] = useState<League[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // Initialize selectedTeamId from URL if present
  useEffect(() => {
    const teamId = searchParams.get("teamId");
    if (teamId) {
      setSelectedTeamId(teamId);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (session?.user) {
      // Check if user is admin
      if (session.user.roles && Array.isArray(session.user.roles)) {
        const userIsAdmin = session.user.roles.some(role => role.id === '2');
        setIsAdmin(userIsAdmin);
      }
    }
  }, [session]);

  useEffect(() => {
    async function fetchLeagues() {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        if (isAdmin) {
          // Admin view: fetch all leagues
          
          // Fetch active leagues (registration or active status)
          const activeResponse = await fetch('/api/leagues?active=true');
          const activeData = await activeResponse.json();
          
          if (activeData.leagues) {
            // Ensure each league has an id property
            const processedActiveLeagues = activeData.leagues.map((league: any) => ({
              ...league,
              id: league._id || league.id
            }));
            setActiveLeagues(processedActiveLeagues);
          }
          
          // Fetch past leagues (completed status)
          const pastResponse = await fetch('/api/leagues?status=completed');
          const pastData = await pastResponse.json();
          
          if (pastData.leagues) {
            // Ensure each league has an id property
            const processedPastLeagues = pastData.leagues.map((league: any) => ({
              ...league,
              id: league._id || league.id
            }));
            setPastLeagues(processedPastLeagues);
          }
          
          // Fetch leagues where the user is organizer
          const myResponse = await fetch(`/api/leagues?organizer=${session.user.id}`);
          const myData = await myResponse.json();
          
          if (myData.leagues) {
            // Ensure each league has an id property
            const processedMyLeagues = myData.leagues.map((league: any) => ({
              ...league,
              id: league._id || league.id
            }));
            setMyLeagues(processedMyLeagues);
          }
        } else {
          // Player view: fetch leagues the player is in
          
          // Fetch the player's active leagues
          const activeResponse = await fetch('/api/players/leagues?active=true');
          if (!activeResponse.ok) {
            throw new Error(`Failed to fetch active leagues: ${activeResponse.statusText}`);
          }
          const activeData = await activeResponse.json();

          if (activeData.leagues) {
            // Ensure each league has an id property
            const processedActiveLeagues = activeData.leagues.map((league: any) => ({
              ...league,
              id: league._id || league.id
            }));
            setActiveLeagues(processedActiveLeagues);
          }

          // Fetch past leagues (completed)
          const pastResponse = await fetch('/api/players/leagues?status=completed');
          if (!pastResponse.ok) {
            throw new Error(`Failed to fetch past leagues: ${pastResponse.statusText}`);
          }
          const pastData = await pastResponse.json();

          if (pastData.leagues) {
            // Ensure each league has an id property
            const processedPastLeagues = pastData.leagues.map((league: any) => ({
              ...league,
              id: league._id || league.id
            }));
            setPastLeagues(processedPastLeagues);
          }
        }
        
        // Fetch user's teams (for all users)
        const playerResponse = await fetch(`/api/players?userId=${session.user.id}`);
        const playerData = await playerResponse.json();
        
        if (playerData.players && playerData.players.length > 0) {
          const playerId = playerData.players[0].id || playerData.players[0]._id;
          
          // Fetch teams for this player
          const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
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
        toast.error("Failed to load leagues");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagues();
  }, [session, isAdmin]);
  
  function LeagueCard({ league }: { league: League }) {
    const isRegistrationOpen = 
      league.status === 'registration' && 
      new Date(league.registrationDeadline) > new Date();
    
    const isUserOrganizer = league.organizer && league.organizer.id === session?.user?.id;
    
    // Check if user's team is in this league
    const userTeamInLeague = selectedTeamId && league.teams.some(team => team.id === selectedTeamId);
    
    // For player view, find user's team in this league
    const userTeam = !isAdmin && league.teams.find(team =>
      team.players && team.players.some((player: any) =>
        player.userId === session?.user?.id
      )
    );
    
    // Check if league is full
    const isLeagueFull = league.teams.length >= league.maxTeams;
    
    // Ensure the league ID is available
    const leagueId = league.id || league._id;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {league.name}
            {league.status === 'active' && 
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Active</span>
            }
            {league.status === 'registration' && 
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Registration Open</span>
            }
            {league.status === 'completed' && 
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Completed</span>
            }
          </CardTitle>
          <CardDescription>
            {league.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span>{formatMatchType(league.matchFormat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teams:</span>
              <span>{league.teams.length} / {league.maxTeams}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dates:</span>
              <span>{new Date(league.startDate).toLocaleDateString()} - {new Date(league.endDate).toLocaleDateString()}</span>
            </div>
            {league.status === 'registration' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Deadline:</span>
                <span className="font-medium">
                  {formatDistance(new Date(league.registrationDeadline), new Date(), { addSuffix: true })}
                </span>
              </div>
            )}
            {league.venue && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Venue:</span>
                <span>{league.venue}</span>
              </div>
            )}
            {userTeam && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Team:</span>
                <span className="font-medium">{userTeam.name}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={`/dashboard/leagues/${leagueId}`}>
              View Details
            </Link>
          </Button>
          
          {isRegistrationOpen && selectedTeamId && !userTeamInLeague && !isLeagueFull && (
            <Button 
              size="sm"
              asChild
            >
              <Link href={`/dashboard/leagues/${leagueId}/join?teamId=${selectedTeamId}`}>
                Join League
              </Link>
            </Button>
          )}
          
          {(userTeamInLeague || userTeam) && (
            <Button 
              size="sm"
              variant="outline"
              asChild
            >
              <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Link>
            </Button>
          )}
          
          {isUserOrganizer && (
            <Button 
              size="sm"
              variant="outline"
              asChild
            >
              <Link href={`/dashboard/leagues/${leagueId}/manage`}>
                Manage
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{isAdmin ? "All Leagues" : "My Leagues"}</h1>
        {isAdmin && (
          <Button asChild>
            <Link href="/dashboard/leagues/create">
              <Plus className="w-4 h-4 mr-2" />
              Create League
            </Link>
          </Button>
        )}
        {!isAdmin && (
          <Button asChild variant="outline">
            <Link href="/dashboard/teams">
              <Users className="w-4 h-4 mr-2" />
              My Teams
            </Link>
          </Button>
        )}
      </div>
      
      {myTeams.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
            <CardDescription>
              {isAdmin ? "Select one of your teams to see which leagues you can join." : "Your teams in the system."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {myTeams.map(team => (
                <Button
                  key={team.id}
                  variant={selectedTeamId === team.id ? "default" : "outline"}
                  onClick={() => setSelectedTeamId(team.id)}
                  size="sm"
                >
                  <Users className="w-4 h-4 mr-1" />
                  {team.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Admin specific tabs */}
      {isAdmin ? (
        <Tabs defaultValue="my">
          <TabsList className="mb-4">
            <TabsTrigger value="my">My Leagues</TabsTrigger>
            <TabsTrigger value="active">Active Leagues</TabsTrigger>
            <TabsTrigger value="past">Past Leagues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading leagues...</div>
              </div>
            ) : myLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myLeagues.map(league => (
                  <LeagueCard key={league.id || league._id} league={league} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Leagues Created</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any leagues yet.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/leagues/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First League
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading leagues...</div>
              </div>
            ) : activeLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeLeagues.map(league => (
                  <LeagueCard key={league.id || league._id} league={league} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Active Leagues</h3>
                  <p className="text-muted-foreground mb-6">
                    There are currently no active leagues available to join.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/leagues/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create a League
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading leagues...</div>
              </div>
            ) : pastLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastLeagues.map(league => (
                  <LeagueCard key={league.id || league._id} league={league} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Past Leagues</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no completed leagues in your history.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Player specific tabs */
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Leagues</TabsTrigger>
            <TabsTrigger value="past">Past Leagues</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading leagues...</div>
              </div>
            ) : activeLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeLeagues.map(league => (
                  <LeagueCard key={league.id || league._id} league={league} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Active Leagues</h3>
                  <p className="text-muted-foreground mb-6">
                    You're not currently participating in any active leagues.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/teams">
                      <Plus className="w-4 h-4 mr-2" />
                      Create or Join a Team
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="animate-pulse text-muted-foreground">Loading leagues...</div>
              </div>
            ) : pastLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pastLeagues.map(league => (
                  <LeagueCard key={league.id || league._id} league={league} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Past Leagues</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't participated in any completed leagues yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Use standard withAuth instead of withRoleAuth to allow both admins and players
export default withAuth(LeaguesPage);