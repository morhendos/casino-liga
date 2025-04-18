"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, List, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";
import ScheduleGenerationForm from "@/components/admin/ScheduleGenerationForm";
import ScheduleManagementTable from "@/components/admin/ScheduleManagementTable";
import ScheduleVisualization from "@/components/admin/ScheduleVisualization";

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
  const { data: session } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("view");

  // Extract the ID from params
  const leagueId = params?.id as string;

  useEffect(() => {
    if (session) {
      const userIsAdmin = hasRole(session, ROLES.ADMIN);
      setIsAdmin(userIsAdmin);
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

  const fetchSchedule = async () => {
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
      
      // Process matches
      const processedMatches = data.map((match: any) => ({
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
    fetchSchedule();
    
    // Reload league to update scheduleGenerated flag
    async function reloadLeague() {
      try {
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
        
        // Switch to view tab after schedule is generated
        setActiveTab("view");
      } catch (error) {
        console.error("Error reloading league:", error);
      }
    }
    
    reloadLeague();
  };

  const handleScheduleCleared = () => {
    setMatches([]);
    
    // Reload league to update scheduleGenerated flag
    async function reloadLeague() {
      try {
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
        
        // Switch to generate tab after schedule is cleared
        setActiveTab("generate");
      } catch (error) {
        console.error("Error reloading league:", error);
      }
    }
    
    reloadLeague();
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
      
      {!league?.scheduleGenerated && !isAdmin ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>No Schedule Generated</CardTitle>
            <CardDescription>
              This league doesn't have a schedule yet. The league administrator will generate the schedule soon.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : league?.scheduleGenerated && matches.length === 0 ? (
        <Card className="max-w-3xl mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>Loading Schedule</CardTitle>
            <CardDescription>
              The schedule is being loaded. If this persists, please refresh the page.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div>
          {isAdmin ? (
            <Tabs defaultValue={league?.scheduleGenerated ? "view" : "generate"} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="view" disabled={!league?.scheduleGenerated}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </TabsTrigger>
                <TabsTrigger value="manage" disabled={!league?.scheduleGenerated}>
                  <List className="w-4 h-4 mr-2" />
                  Manage Matches
                </TabsTrigger>
                <TabsTrigger value="generate">
                  <Settings className="w-4 h-4 mr-2" />
                  {league?.scheduleGenerated ? 'Regenerate Schedule' : 'Generate Schedule'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="view">
                <ScheduleVisualization 
                  matches={matches} 
                  teams={league?.teams || []} 
                  onMatchClick={handleMatchClick} 
                />
              </TabsContent>
              
              <TabsContent value="manage">
                <ScheduleManagementTable 
                  matches={matches} 
                  leagueId={leagueId} 
                  isAdmin={isAdmin}
                  onMatchUpdated={fetchSchedule}
                  onScheduleCleared={handleScheduleCleared}
                />
              </TabsContent>
              
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
            <ScheduleVisualization 
              matches={matches} 
              teams={league?.teams || []} 
              onMatchClick={handleMatchClick} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default withAuth(LeagueSchedulePage);