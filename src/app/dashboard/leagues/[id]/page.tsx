"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowLeft, Trophy, Settings, Edit, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import LeaguePlayerManager from "@/components/admin/LeaguePlayerManager";
import { DeleteLeagueButton } from "@/components/admin/DeleteLeagueButton";

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
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if this is a newly created league
  const fromCreate = searchParams.get("fromCreate") === "true";
  // Set the default tab
  const [activeTab, setActiveTab] = useState(fromCreate && isAdmin ? "teams" : "overview");

  // Extract the ID from params
  const leagueId = params?.id as string;

  useEffect(() => {
    if (session) {
      const userIsAdmin = hasRole(session, ROLES.ADMIN);
      setIsAdmin(userIsAdmin);
      
      // If we're coming from create and the user is an admin, show the teams tab
      if (fromCreate && userIsAdmin) {
        setActiveTab("teams");
      }
    }
  }, [session, fromCreate]);

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const fetchLeagueDetails = async () => {
    if (!leagueId || leagueId === "undefined") {
      setError("Invalid league ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
  };
  
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

  function formatDate(dateString?: string): string {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
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
      {/* Navigation Section - Back button on its own line */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link href="/dashboard/leagues">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Link>
        </Button>
      </div>
      
      {/* Title Section - Title and status badge on their own line */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
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
      </div>
      
      {/* Tabs for both admin and regular users */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <Trophy className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="w-4 h-4 mr-2" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          
          {/* Admin-only tabs */}
          {isAdmin && (
            <>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        {/* League Overview Tab - Visible to all users */}
        <TabsContent value="overview">
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
                        <div>{formatDate(league.startDate)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">End Date</div>
                        <div>{formatDate(league.endDate)}</div>
                      </div>
                      {league.status === 'registration' && (
                        <div>
                          <div className="text-sm text-muted-foreground">Registration Deadline</div>
                          <div>{formatDate(league.registrationDeadline)}</div>
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
                      {isAdmin && (
                        <p className="text-sm mt-2">
                          Use the Teams tab to add teams to this league.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                {league.status === 'registration' && !isAdmin && (
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/leagues/${league.id}/join`}>
                        Join League
                      </Link>
                    </Button>
                  </CardFooter>
                )}
                {isAdmin && league.teams.length === 0 && (
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("teams")}
                    >
                      Add Teams to League
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Teams Tab - Consolidated team management for all users */}
        <TabsContent value="teams">
          <div className="space-y-8">
            {/* For admins, show the team management section first */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>
                    Add players and create teams for this league
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaguePlayerManager 
                    leagueId={league.id} 
                    onPlayersUpdated={fetchLeagueDetails}
                  />
                </CardContent>
              </Card>
            )}
            
            {/* Team list section for all users */}
            <Card>
              <CardHeader>
                <CardTitle>Teams in this League</CardTitle>
                <CardDescription>
                  {league.teams.length > 0 
                    ? `${league.teams.length} of ${league.maxTeams} maximum teams` 
                    : "No teams have joined this league yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {league.teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {league.teams.map((team) => (
                      <Card key={team.id || team._id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle>{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Players:</div>
                            {team.players?.map(player => (
                              <div key={player.id} className="flex justify-between items-center border-b pb-1">
                                <div>{player.nickname}</div>
                                <div className="text-xs text-muted-foreground">
                                  Level: {player.skillLevel}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button size="sm" variant="outline" asChild className="w-full">
                            <Link href={`/dashboard/teams/${team.id || team._id}`}>
                              View Team Details
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-medium mb-2">No Teams Registered</h3>
                    <p className="text-muted-foreground mb-6">
                      There are currently no teams registered in this league.
                    </p>
                    {isAdmin && !fromCreate && (
                      <p className="text-muted-foreground">
                        Use the team management section above to add teams to this league.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Show welcome message if coming from league creation */}
            {fromCreate && isAdmin && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-6">
                <h3 className="text-blue-800 font-medium">Your league has been created successfully!</h3>
                <p className="text-blue-600 text-sm mt-1">
                  Now you can add players and create teams for your new league. Once you've added teams, you can generate a schedule.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Schedule Tab - View schedule for all users */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>League Schedule</CardTitle>
              <CardDescription>
                View the match schedule for this league
              </CardDescription>
            </CardHeader>
            <CardContent>
              {league.scheduleGenerated ? (
                <div>
                  {/* Schedule content would go here */}
                  <p className="text-center py-4">Schedule information will be displayed here.</p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2">No Schedule Yet</h3>
                  <p className="text-muted-foreground mb-2">
                    The schedule has not been generated for this league yet.
                  </p>
                  {isAdmin && (
                    <>
                      <p className="text-sm text-muted-foreground mb-6">
                        You can generate a schedule once you have enough teams.
                      </p>
                      <Button disabled={league.teams.length < 2}>
                        Generate Schedule
                      </Button>
                      {league.teams.length < 2 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          You need at least 2 teams to generate a schedule.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ADMIN TABS - Only visible to admin users */}
        
        {/* League Settings Tab - Admin only */}
        {isAdmin && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>League Settings</CardTitle>
                <CardDescription>
                  Manage your league's settings and details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">{league.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="font-medium">{league.status.charAt(0).toUpperCase() + league.status.slice(1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Description</div>
                      <div>{league.description || "No description provided"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Match Format</div>
                      <div>{formatMatchType(league.matchFormat)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Start Date</div>
                      <div>{formatDate(league.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">End Date</div>
                      <div>{formatDate(league.endDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Registration Deadline</div>
                      <div>{formatDate(league.registrationDeadline)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Venue</div>
                      <div>{league.venue || "Not specified"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Teams</div>
                      <div>{league.teams.length} / {league.maxTeams}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Points System</div>
                      <div>Win: {league.pointsPerWin} / Loss: {league.pointsPerLoss}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/dashboard/leagues/${league.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit League
                  </Link>
                </Button>
                
                <DeleteLeagueButton 
                  leagueId={league.id} 
                  leagueName={league.name}
                />
                
                {league.status === 'draft' && (
                  <Button variant="outline">
                    Publish League
                  </Button>
                )}
                
                {league.status === 'registration' && (
                  <Button variant="outline">
                    Open League
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default withAuth(LeagueDetailsPage);
