"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, LayoutDashboard, Users, CalendarDays, Settings, CheckCircle2, PlusCircle, Zap } from "lucide-react";
import Link from "next/link";
import LeaguePlayerManager from "@/components/admin/LeaguePlayerManager";
import LeagueStatusManager from "@/components/admin/LeagueStatusManager";
import LeagueSetupProgress from "@/components/admin/LeagueSetupProgress";
import { DeleteLeagueButton } from "@/components/admin/DeleteLeagueButton";
import ShareLeagueButton from "@/components/leagues/ShareLeagueButton";

interface League {
  id: string;
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  maxTeams: number;
  minTeams: number;
  teams: Team[];
  scheduleGenerated: boolean;
  isPublic: boolean;
}

interface Team {
  id: string;
  _id: string;
  name: string;
  players: any[];
}

function LeagueManagePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const fromCreate = searchParams.get("fromCreate") === "true";
  
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamesCount, setGamesCount] = useState(0);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  
  // Default to "overview" or to "teams" if coming from league creation
  const [activeTab, setActiveTab] = useState(fromCreate ? "teams" : "overview");
  
  // Get league ID from params
  const leagueId = params?.id as string;
  
  // Fetch league data
  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  // Fetch games count
  useEffect(() => {
    const fetchGamesCount = async () => {
      if (!leagueId) return;
      
      try {
        setIsLoadingGames(true);
        const response = await fetch(`/api/leagues/${leagueId}/schedule`);
        
        if (response.ok) {
          const games = await response.json();
          setGamesCount(Array.isArray(games) ? games.length : 0);
        } else {
          setGamesCount(0);
        }
      } catch (error) {
        console.error("Error fetching games count:", error);
        setGamesCount(0);
      } finally {
        setIsLoadingGames(false);
      }
    };
    
    fetchGamesCount();
  }, [leagueId]);
  
  const fetchLeagueDetails = async () => {
    if (!leagueId) {
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
      
      const data = await response.json();
      
      // Process the data
      const processedLeague = {
        ...data,
        id: data._id || data.id,
        teams: data.teams?.map((team: any) => ({
          ...team,
          id: team._id || team.id,
        })) || [],
        isPublic: data.isPublic !== false // Default to true if not specified
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
  
  // Handle league status change
  const handleStatusChange = async (newStatus: string) => {
    // Refresh league data after status change
    fetchLeagueDetails();
  };

  // Handle league deletion 
  const handleLeagueDeleted = () => {
    // Redirect to the leagues list after successful deletion
    router.push('/dashboard/leagues');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !league) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "Could not load league details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/leagues")}
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
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mb-4 sm:mb-0"
          >
            <Link href={`/dashboard/leagues/${leagueId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to League
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            Managing: {league.name}
          </h1>
          <ShareLeagueButton leagueId={league.id} isPublic={league.isPublic} />
        </div>
      </div>
      
      {/* Show welcome message if coming from creation */}
      {fromCreate && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-blue-800 font-medium">League created successfully!</h3>
          <p className="text-blue-600 text-sm mt-1">
            Now you can add players and create teams for your new league. Follow the steps below to complete the setup.
          </p>
        </div>
      )}
      
      {/* Main content with tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with status and progress */}
        <div className="md:col-span-1 space-y-6">
          <LeagueStatusManager
            leagueId={league.id}
            currentStatus={league.status as any}
            teamsCount={league.teams.length}
            minTeams={league.minTeams}
            maxTeams={league.maxTeams}
            hasSchedule={league.scheduleGenerated}
            onStatusChange={handleStatusChange}
          />
          
          <LeagueSetupProgress
            leagueId={league.id}
            leagueName={league.name}
            currentStatus={league.status}
            teamsCount={league.teams.length}
            minTeams={league.minTeams}
            hasSchedule={league.scheduleGenerated}
            isComplete={league.status === "active" || league.status === "completed"}
          />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="h-4 w-4 mr-2" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="games">
                <PlusCircle className="h-4 w-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>League Dashboard</CardTitle>
                  <CardDescription>
                    Overview of your league's current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Teams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {league.teams.length} / {league.maxTeams}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {league.teams.length >= league.minTeams 
                            ? "Minimum requirement met ✓" 
                            : `Need ${league.minTeams - league.teams.length} more team(s)`}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setActiveTab("teams")}
                        >
                          Manage Teams
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Games</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {isLoadingGames ? "..." : gamesCount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {gamesCount > 0 
                            ? "Games created ✓" 
                            : "No games created yet"}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => router.push(`/dashboard/leagues/${league.id}/schedule?tab=games`)}
                        >
                          Create Games
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {league.scheduleGenerated ? "Created" : "Not Generated"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {league.scheduleGenerated 
                            ? "Match schedule is ready" 
                            : "Schedule is optional"}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setActiveTab("schedule")}
                        >
                          {league.scheduleGenerated ? "View Schedule" : "Schedule Options"}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Teams tab */}
            <TabsContent value="teams">
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
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Games tab */}
            <TabsContent value="games">
              <Card>
                <CardHeader>
                  <CardTitle>Game Management</CardTitle>
                  <CardDescription>
                    Create and manage games for this league
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {league.teams.length < 2 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Not Enough Teams</h3>
                      <p className="text-muted-foreground mb-6">
                        You need at least 2 teams to create games.
                      </p>
                      <Button onClick={() => setActiveTab("teams")}>
                        Add Teams First
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center bg-blue-50 border border-blue-100 rounded-md p-6">
                          <PlusCircle className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-blue-700">Create Individual Games</h3>
                          <p className="text-blue-600 mb-6">
                            Manually create games one by one with specific dates and times.
                          </p>
                          <Button asChild>
                            <Link href={`/dashboard/leagues/${league.id}/schedule?tab=games`}>
                              {gamesCount > 0 ? "Manage Games" : "Create Games"}
                            </Link>
                          </Button>
                        </div>
                        
                        <div className="text-center bg-purple-50 border border-purple-100 rounded-md p-6">
                          <Zap className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-purple-700">Bulk Generate Games</h3>
                          <p className="text-purple-600 mb-6">
                            Automatically generate all possible game matchups at once.
                          </p>
                          <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <Link href={`/dashboard/leagues/${league.id}/schedule?tab=bulk-games`}>
                              Generate All Matchups
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Schedule tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Management</CardTitle>
                  <CardDescription>
                    {league.scheduleGenerated 
                      ? "View and manage your league schedule" 
                      : "Generate a schedule for this league (optional)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {league.teams.length < 2 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Not Enough Teams</h3>
                      <p className="text-muted-foreground mb-6">
                        You need at least 2 teams to manage schedule.
                      </p>
                      <Button onClick={() => setActiveTab("teams")}>
                        Add Teams First
                      </Button>
                    </div>
                  ) : gamesCount === 0 ? (
                    <div className="text-center py-12">
                      <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Games Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        You need to create games before managing the schedule.
                      </p>
                      <Button onClick={() => setActiveTab("games")}>
                        Create Games First
                      </Button>
                    </div>
                  ) : league.scheduleGenerated ? (
                    <div className="space-y-6">
                      <div className="text-center bg-green-50 border border-green-100 rounded-md p-6">
                        <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2 text-green-700">Schedule Generated</h3>
                        <p className="text-green-600 mb-6">
                          Your league schedule has been created and is ready for use.
                        </p>
                        <Button asChild>
                          <Link href={`/dashboard/leagues/${league.id}/schedule`}>
                            View & Manage Schedule
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Generate Schedule (Optional)</h3>
                      <p className="text-muted-foreground mb-6">
                        You can optionally generate a round-robin schedule for all teams in this league.
                      </p>
                      <Button asChild>
                        <Link href={`/dashboard/leagues/${league.id}/schedule?tab=generate`}>
                          Generate Schedule
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>League Settings</CardTitle>
                  <CardDescription>
                    Edit league details and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Edit Settings</h3>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/leagues/${leagueId}/edit`}>
                        Edit League Details
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-2 text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions cannot be undone. Please be certain.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <DeleteLeagueButton 
                        leagueId={league.id} 
                        leagueName={league.name}
                        onDeleted={handleLeagueDeleted}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default withRoleAuth(LeagueManagePage, [ROLES.ADMIN]);
