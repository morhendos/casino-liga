"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, List, Settings, PlusCircle, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";
import ScheduleGenerationForm from "@/components/admin/ScheduleGenerationForm";
import ScheduleManagementTable from "@/components/admin/ScheduleManagementTable";
import ScheduleVisualization from "@/components/admin/ScheduleVisualization";
import GameCreationForm from "@/components/admin/GameCreationForm";
import GameManagement from "@/components/admin/GameManagement";
import BulkGameGenerationForm from "@/components/admin/BulkGameGenerationForm";

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

interface Team {
  id: string;
  _id: string;
  name: string;
  players: any[];
}

interface League {
  id: string;
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  teams: Team[];
  scheduleGenerated: boolean;
  status: string;
  organizer: any;
  venue?: string;
  minTeams: number;
}

function LeagueSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Get tab from query params or default to "view" or "games"
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabParam || "games"
  );

  // Extract the ID from params
  const leagueId = params?.id as string;
  
  console.log("LeagueSchedulePage initialized with leagueId:", leagueId);

  useEffect(() => {
    if (session) {
      const userIsAdmin = hasRole(session, ROLES.ADMIN);
      setIsAdmin(userIsAdmin);
      console.log("User is admin:", userIsAdmin);
    }
  }, [session]);

  useEffect(() => {
    async function fetchLeagueDetails() {
      if (!leagueId || leagueId === "undefined") {
        setError("Invalid league ID");
        setIsLoadingLeague(false);
        return;
      }
      
      try {
        setIsLoadingLeague(true);
        console.log("Fetching league details for ID:", leagueId);
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const leagueData = await response.json();
        console.log("League data received:", leagueData);
        
        // Ensure ID is available in the expected format
        const processedLeague = {
          ...leagueData,
          id: leagueData._id || leagueData.id,
          teams: leagueData.teams?.map((team: any) => {
            console.log("Processing team:", team);
            return {
              ...team,
              id: team._id || team.id
            };
          }) || []
        };
        
        console.log("Processed league:", processedLeague);
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

  const fetchSchedule = async () => {
    if (!leagueId || leagueId === "undefined") {
      setError("Invalid league ID");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching schedule for league ID:", leagueId);
      const response = await fetch(`/api/leagues/${leagueId}/schedule`);
      
      if (!response.ok) {
        console.error("API returned error status:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Error fetching schedule: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Raw schedule data received:", data);
      
      // Validate data before processing
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        throw new Error("Received invalid data format from API");
      }
      
      // Process matches - with safety checks for both teamA and teamB
      const processedMatches = data.map((match: any) => {
        console.log("Processing match:", match);
        
        try {
          return {
            ...match,
            id: match._id || match.id,
            teamA: {
              ...match.teamA,
              id: match.teamA._id || match.teamA.id || 'missing-id'
            },
            teamB: {
              ...match.teamB,
              id: match.teamB._id || match.teamB.id || 'missing-id'
            }
          };
        } catch (err) {
          console.error("Error processing match:", err, match);
          // Return a sanitized match with default values for any missing data
          return {
            ...match,
            id: match._id || match.id || 'unknown-id',
            teamA: match.teamA || { 
              id: 'missing-team-a', 
              name: 'Unknown Team A',
              players: []
            },
            teamB: match.teamB || { 
              id: 'missing-team-b', 
              name: 'Unknown Team B',
              players: []
            }
          };
        }
      });
      
      console.log("Processed matches:", processedMatches);
      setMatches(processedMatches);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Failed to load schedule");
      toast.error("Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [leagueId]);

  const handleScheduleGenerated = () => {
    console.log("Schedule generated - refreshing data");
    fetchSchedule();
    
    // Reload league to update scheduleGenerated flag
    async function reloadLeague() {
      try {
        console.log("Reloading league data after schedule generation");
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const leagueData = await response.json();
        console.log("Updated league data:", leagueData);
        
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
        
        // Switch to view tab after schedule is generated
        setActiveTab("view");
      } catch (error) {
        console.error("Error reloading league:", error);
      }
    }
    
    reloadLeague();
  };

  const handleScheduleCleared = () => {
    console.log("Schedule cleared");
    setMatches([]);
    
    // Reload league to update scheduleGenerated flag
    async function reloadLeague() {
      try {
        console.log("Reloading league data after schedule cleared");
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const leagueData = await response.json();
        console.log("Updated league data after clearing:", leagueData);
        
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
        
        // Switch to generate tab after schedule is cleared
        setActiveTab("generate");
      } catch (error) {
        console.error("Error reloading league:", error);
      }
    }
    
    reloadLeague();
  };

  const handleGameCreated = () => {
    console.log("Game created - refreshing data");
    fetchSchedule();
    toast.success("Game successfully added to the league");
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/dashboard/matches/${matchId}`);
  };

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

  // Check if there are enough teams for creating games
  const hasEnoughTeams = league?.teams && league.teams.length >= 2;

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
          {league?.name} - Games & Schedule
        </h1>
      </div>
      
      <div>
        {isAdmin ? (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="games">
                <PlusCircle className="w-4 h-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="bulk-games">
                <Zap className="w-4 h-4 mr-2" />
                Bulk Generate
              </TabsTrigger>
              <TabsTrigger value="view" disabled={!hasEnoughTeams || matches.length === 0}>
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </TabsTrigger>
              <TabsTrigger value="manage" disabled={!hasEnoughTeams || matches.length === 0}>
                <List className="w-4 h-4 mr-2" />
                Matches List
              </TabsTrigger>
              <TabsTrigger value="generate">
                <Settings className="w-4 h-4 mr-2" />
                Generate Schedule
              </TabsTrigger>
            </TabsList>
            
            {/* Games tab - for explicit game creation */}
            <TabsContent value="games">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {hasEnoughTeams ? (
                    <GameCreationForm 
                      leagueId={leagueId}
                      teams={league?.teams || []}
                      onGameCreated={handleGameCreated}
                    />
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Create Game</CardTitle>
                        <CardDescription>
                          You need at least 2 teams to create games.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-6">
                        <p className="text-muted-foreground mb-4">Add more teams to the league before creating games</p>
                        <Button asChild>
                          <Link href={`/dashboard/leagues/${leagueId}/manage?tab=teams`}>
                            Add Teams
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div>
                  <GameManagement 
                    leagueId={leagueId}
                    matches={matches}
                    isAdmin={isAdmin}
                    onMatchUpdated={fetchSchedule}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Bulk Game Generation tab */}
            <TabsContent value="bulk-games">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <BulkGameGenerationForm
                    leagueId={leagueId}
                    teams={league?.teams || []} 
                    onGamesGenerated={fetchSchedule}
                  />
                </div>
                
                <div>
                  <GameManagement 
                    leagueId={leagueId}
                    matches={matches}
                    isAdmin={isAdmin}
                    onMatchUpdated={fetchSchedule}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Calendar view tab */}
            <TabsContent value="view">
              <ScheduleVisualization 
                matches={matches} 
                teams={league?.teams || []} 
                onMatchClick={handleMatchClick} 
              />
            </TabsContent>
            
            {/* Manage matches tab */}
            <TabsContent value="manage">
              <ScheduleManagementTable 
                matches={matches} 
                leagueId={leagueId} 
                isAdmin={isAdmin}
                onMatchUpdated={fetchSchedule}
                onScheduleCleared={handleScheduleCleared}
              />
            </TabsContent>
            
            {/* Generate schedule tab */}
            <TabsContent value="generate">
              <ScheduleGenerationForm 
                leagueId={leagueId}
                teamsCount={league?.teams?.length || 0}
                minTeams={league?.minTeams || 2}
                startDate={league?.startDate || new Date()}
                endDate={league?.endDate || new Date()}
                venue={league?.venue}
                onScheduleGenerated={handleScheduleGenerated}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Non-admin view
          <div>
            {matches.length === 0 ? (
              <Card className="max-w-3xl mx-auto text-center p-8">
                <CardHeader>
                  <CardTitle>No Games Yet</CardTitle>
                  <CardDescription>
                    This league doesn't have any games yet. Check back later.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <ScheduleVisualization 
                matches={matches} 
                teams={league?.teams || []} 
                onMatchClick={handleMatchClick} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(LeagueSchedulePage);
