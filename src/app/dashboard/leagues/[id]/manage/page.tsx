"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, ArrowLeft, Trophy, Edit, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import LeaguePlayerManager from "@/components/admin/LeaguePlayerManager";

interface League {
  id: string;
  _id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
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

function LeagueManagePage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Extract the ID from params
  const leagueId = params?.id as string;

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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">
            <Settings className="w-4 h-4 mr-2" />
            League Settings
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Users className="w-4 h-4 mr-2" />
            Manage Teams
          </TabsTrigger>
          <TabsTrigger value="players">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Players
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Manage Schedule
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="details">
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
            <CardFooter className="flex gap-2">
              <Button asChild>
                <Link href={`/dashboard/leagues/${league.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit League
                </Link>
              </Button>
              
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
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                View and manage teams in this league
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
                  <p className="text-sm mt-2">Use the "Add Players" tab to create teams for this league.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => setActiveTab("players")}
              >
                Add Teams to League
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <LeaguePlayerManager 
            leagueId={league.id} 
            onPlayersUpdated={fetchLeagueDetails}
          />
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>
                {league.scheduleGenerated ? 
                  "View and manage the league schedule" : 
                  "Generate a schedule for this league"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {league.scheduleGenerated ? (
                <div className="text-center py-4">
                  <p>Schedule has been generated.</p>
                  <p className="text-muted-foreground">You can view and manage matches below.</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No schedule has been generated yet.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a schedule to automatically generate matches between teams.
                  </p>
                  <Button disabled={league.teams.length < 2}>
                    Generate Schedule
                  </Button>
                  {league.teams.length < 2 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      You need at least 2 teams to generate a schedule.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            {league.scheduleGenerated && (
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href={`/dashboard/leagues/${league.id}/schedule`}>
                    View Full Schedule
                  </Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Protect this page with admin-only access
export default withRoleAuth(LeagueManagePage, [ROLES.ADMIN]);