"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, LayoutDashboard, Users, CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import LeaguePlayerManager from "@/components/admin/LeaguePlayerManager";
import LeagueStatusManager from "@/components/admin/LeagueStatusManager";
import LeagueSetupProgress from "@/components/admin/LeagueSetupProgress";

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
  
  // Default to "overview" or to "teams" if coming from league creation
  const [activeTab, setActiveTab] = useState(fromCreate ? "teams" : "overview");
  
  // Get league ID from params
  const leagueId = params?.id as string;
  
  // Fetch league data
  useEffect(() => {
    fetchLeagueDetails();
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
  
  // Handle league status change
  const handleStatusChange = async (newStatus: string) => {
    // Refresh league data after status change
    fetchLeagueDetails();
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
        
        <div>
          <h1 className="text-2xl font-bold">
            Managing: {league.name}
          </h1>
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
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="h-4 w-4 mr-2" />
                Teams
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <CardTitle className="text-lg">Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {league.scheduleGenerated ? "Created" : "Not Generated"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {league.scheduleGenerated 
                            ? "Match schedule is ready" 
                            : "Schedule needs to be generated"}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                          onClick={() => setActiveTab("schedule")}
                        >
                          {league.scheduleGenerated ? "View Schedule" : "Generate Schedule"}
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Additional stats can go here */}
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
            
            {/* Schedule tab */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Management</CardTitle>
                  <CardDescription>
                    {league.scheduleGenerated 
                      ? "View and manage your league schedule" 
                      : "Generate a schedule for this league"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {league.teams.length < 2 ? (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Not Enough Teams</h3>
                      <p className="text-muted-foreground mb-6">
                        You need at least 2 teams to generate a schedule.
                      </p>
                      <Button onClick={() => setActiveTab("teams")}>
                        Add Teams First
                      </Button>
                    </div>
                  ) : league.scheduleGenerated ? (
                    <div className="text-center py-12">
                      <p>Schedule viewer will be implemented in the next phase.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Generate Schedule</h3>
                      <p className="text-muted-foreground mb-6">
                        Create a round-robin schedule for all teams in this league.
                      </p>
                      <Button>
                        Generate Schedule
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
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/leagues/${league.id}/edit`}>
                      Edit League Details
                    </Link>
                  </Button>
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
