"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Trophy, Calendar, FileBarChart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";
import LeagueRankingsTable from "@/components/league/LeagueRankingsTable";

interface League {
  id: string;
  name: string;
  description?: string;
  status: string;
  scheduleGenerated: boolean;
  teams: any[];
}

function LeagueRankingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
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
  
  // Function to handle recalculation of rankings
  const handleRecalculateRankings = async () => {
    if (!leagueId) return;
    
    try {
      setIsRecalculating(true);
      const response = await fetch(`/api/leagues/${leagueId}/rankings/recalculate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Error recalculating rankings: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Refresh the page to show updated rankings
      router.refresh();
      
      toast.success(result.message || "Rankings recalculated successfully");
    } catch (error) {
      console.error("Error recalculating rankings:", error);
      toast.error("Failed to recalculate rankings");
    } finally {
      setIsRecalculating(false);
    }
  };
  
  if (isLoadingLeague) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse text-center">
          <h2 className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></h2>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded w-full max-w-3xl mx-auto"></div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center">
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
          <div>
            <h1 className="text-2xl font-bold">{league?.name} - Rankings</h1>
            {league?.description && (
              <p className="text-muted-foreground">{league.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
              <Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </Link>
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              onClick={handleRecalculateRankings}
              disabled={isRecalculating}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
              {isRecalculating ? 'Recalculating...' : 'Recalculate Rankings'}
            </Button>
          )}
        </div>
      </div>
      
      {/* League status indicators */}
      {!league?.scheduleGenerated && (
        <Card className="max-w-3xl mx-auto mb-6">
          <CardContent className="pt-6">
            <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-md p-4 text-center">
              <p className="font-medium mb-2">No Schedule Generated</p>
              <p className="text-sm">
                Rankings will be available after matches have been scheduled and played.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {league?.scheduleGenerated && league?.status === 'completed' && (
        <Card className="max-w-3xl mx-auto mb-6">
          <CardContent className="pt-6">
            <div className="bg-green-50 text-green-800 border border-green-200 rounded-md p-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              <div>
                <p className="font-medium">League Completed</p>
                <p className="text-sm">
                  This shows the final standings for the league.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Rankings table */}
      <div className="max-w-4xl mx-auto">
        <LeagueRankingsTable 
          leagueId={leagueId} 
          title={league?.status === 'completed' ? "Final Standings" : "Current Standings"}
          description={league?.status === 'completed' 
            ? "Final rankings for all teams in the completed league" 
            : "Current rankings and statistics for all teams in the league"}
        />
      </div>
      
      {/* Statistics section */}
      <div className="max-w-4xl mx-auto mt-10">
        <div className="flex items-center mb-4">
          <FileBarChart className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">League Statistics</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {/* This would ideally be fetched from an API */}
                {league?.stats?.matchesPlayed || "0"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completed Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {/* This would ideally be fetched from an API */}
                {league?.stats?.matchesCompleted || "0"}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {league?.teams?.length || "0"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(LeagueRankingsPage);
