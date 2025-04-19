"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Match {
  id: string;
  _id: string;
  league: {
    id: string;
    name: string;
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
}

function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const matchId = params?.id as string;
  
  useEffect(() => {
    async function fetchMatchDetails() {
      if (!matchId) {
        setError("Invalid match ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/matches/${matchId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Match not found");
          }
          throw new Error(`Error fetching match details: ${response.statusText}`);
        }
        
        const matchData = await response.json();
        
        // Process the match data to ensure IDs are consistent
        const processedMatch = {
          ...matchData,
          id: matchData._id || matchData.id,
          league: {
            ...matchData.league,
            id: matchData.league._id || matchData.league.id
          },
          teamA: {
            ...matchData.teamA,
            id: matchData.teamA._id || matchData.teamA.id
          },
          teamB: {
            ...matchData.teamB,
            id: matchData.teamB._id || matchData.teamB.id
          }
        };
        
        setMatch(processedMatch);
      } catch (error) {
        console.error("Error fetching match details:", error);
        setError(error instanceof Error ? error.message : "Failed to load match details");
        toast.error("Failed to load match details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMatchDetails();
  }, [matchId]);
  
  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'postponed':
        return <Badge variant="secondary">Postponed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (isLoading) {
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
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Error
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Match Not Found</CardTitle>
            <CardDescription>
              The match you're looking for does not exist or has been deleted.
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Match Details</h1>
        </div>
        {match.league && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={`/dashboard/leagues/${match.league.id}`}>
              View League: {match.league.name}
            </Link>
          </Button>
        )}
      </div>
      
      <Card className="max-w-3xl mx-auto mb-8">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Match Information</CardTitle>
            {match.status && getStatusBadge(match.status)}
          </div>
          <CardDescription>
            View details about this match
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Teams */}
          <div className="bg-muted p-6 rounded-md">
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="font-bold text-xl mb-2">{match.teamA?.name || 'Unknown Team'}</div>
                <div className="text-sm text-muted-foreground">
                  {match.teamA?.players?.length || 0} players
                </div>
              </div>
              
              <div className="px-4 text-xl font-bold">
                VS
              </div>
              
              <div className="flex-1">
                <div className="font-bold text-xl mb-2">{match.teamB?.name || 'Unknown Team'}</div>
                <div className="text-sm text-muted-foreground">
                  {match.teamB?.players?.length || 0} players
                </div>
              </div>
            </div>
          </div>
          
          {/* Match Details */}
          <div className="space-y-4">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Date: {formatDate(match.scheduledDate)}</span>
            </div>
            
            {match.scheduledTime && (
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-5 w-5 mr-2" />
                <span>Time: {match.scheduledTime}</span>
              </div>
            )}
            
            {match.location && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-2" />
                <span>Location: {match.location}</span>
              </div>
            )}
          </div>
          
          {/* Results (if completed) */}
          {match.status === 'completed' && match.result && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-2">Match Results</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-medium">{match.teamA?.name}</h4>
                  <div className="text-xl font-bold">
                    {match.result.teamAScore.join(' - ')}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-sm text-muted-foreground">Sets</div>
                </div>
                <div>
                  <h4 className="font-medium">{match.teamB?.name}</h4>
                  <div className="text-xl font-bold">
                    {match.result.teamBScore.join(' - ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 px-6 py-4 text-center">
          <div className="w-full text-sm text-muted-foreground">
            <p>Match recording features will be coming soon in the next update!</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default withAuth(MatchDetailsPage);
