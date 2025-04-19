"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, PieChart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import MatchHistoryList from "@/components/matches/MatchHistoryList";

interface League {
  id: string;
  name: string;
  description?: string;
  status: string;
}

function LeagueMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract the ID from params
  const leagueId = params?.id as string;
  
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
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error}</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/leagues')}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Button>
        </div>
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
            <h1 className="text-2xl font-bold">{league?.name} - Matches</h1>
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
            <Link href={`/dashboard/leagues/${leagueId}/rankings`}>
              <Trophy className="w-4 h-4 mr-2" />
              View Rankings
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
              <PieChart className="w-4 h-4 mr-2" />
              View Calendar
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Match History */}
      <div className="max-w-5xl mx-auto">
        <MatchHistoryList 
          leagueId={leagueId}
          title="All Matches"
          description={`Complete match history for ${league?.name}`}
        />
      </div>
    </div>
  );
}

export default withAuth(LeagueMatchesPage);
