"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, MapPin, AlertTriangle, Trophy, Edit, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";
import MatchResultForm from "@/components/matches/MatchResultForm";

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
  matchFormat: 'bestOf3' | 'bestOf5' | 'singleSet';
  result?: {
    teamAScore: number[];
    teamBScore: number[];
    winner: string;
  };
}

function MatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  
  const matchId = params?.id as string;
  
  useEffect(() => {
    if (session) {
      const userIsAdmin = hasRole(session, ROLES.ADMIN);
      setIsAdmin(userIsAdmin);
    }
  }, [session]);
  
  const fetchMatchDetails = async () => {
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
        matchFormat: matchData.matchFormat || 'bestOf3', // Default to bestOf3 if not specified
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
      
      // Check if user is the league organizer
      if (session && processedMatch.league?.organizerId) {
        setIsOrganizer(processedMatch.league.organizerId === session.user.id);
      }
      
      // Check if user is a player in one of the teams
      if (session) {
        const isTeamAPlayer = processedMatch.teamA?.players?.some(player => 
          player.user && player.user === session.user.id
        );
        
        const isTeamBPlayer = processedMatch.teamB?.players?.some(player => 
          player.user && player.user === session.user.id
        );
        
        setIsPlayer(isTeamAPlayer || isTeamBPlayer);
      }
    } catch (error) {
      console.error("Error fetching match details:", error);
      setError(error instanceof Error ? error.message : "Failed to load match details");
      toast.error("Failed to load match details");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMatchDetails();
  }, [matchId, session]);
  
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
  
  // Handle recording or editing match result
  const handleRecordResult = () => {
    setShowResultForm(true);
  };
  
  // Handle result form cancel
  const handleResultFormCancel = () => {
    setShowResultForm(false);
  };
  
  // Handle result saved successfully
  const handleResultSaved = () => {
    setShowResultForm(false);
    toast.success("Match result saved successfully");
    fetchMatchDetails(); // Reload match details with new result
  };
  
  // Check if user can record result
  const canRecordResult = () => {
    // Admin can always record
    if (isAdmin) return true;
    
    // Organizer can record
    if (isOrganizer) return true;
    
    // Players can record if match is not already completed
    if (isPlayer && match && match.status !== 'completed') return true;
    
    return false;
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
  
  if (showResultForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => setShowResultForm(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Match Details
          </Button>
          <h1 className="text-2xl font-bold">Record Match Result</h1>
        </div>
        
        <MatchResultForm 
          matchId={matchId}
          teamA={match.teamA}
          teamB={match.teamB}
          matchFormat={match.matchFormat}
          existingResult={match.result}
          onResultSaved={handleResultSaved}
          onCancel={handleResultFormCancel}
        />
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
              <FileText className="w-4 h-4 mr-2" />
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
          {match.status === 'completed' && match.result ? (
            <div className="border-t pt-4">
              <h3 className="font-medium text-lg mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Match Results
              </h3>
              
              <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
                <div className="text-center mb-2 text-green-800 font-medium">
                  Winner: {match.result.winner === match.teamA.id ? match.teamA.name : match.teamB.name}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-medium">{match.teamA?.name}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  Sets
                </div>
                <div>
                  <h4 className="font-medium">{match.teamB?.name}</h4>
                </div>
                
                {match.result.teamAScore.map((score, index) => (
                  <React.Fragment key={`set-${index}`}>
                    <div className={`text-xl font-bold ${score > match.result!.teamBScore[index] ? 'text-green-600' : ''}`}>
                      {score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Set {index + 1}
                    </div>
                    <div className={`text-xl font-bold ${match.result!.teamBScore[index] > score ? 'text-green-600' : ''}`}>
                      {match.result!.teamBScore[index]}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            match.status !== 'canceled' && match.status !== 'postponed' && (
              <div className="border-t pt-4">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                  <h3 className="font-medium text-blue-800 mb-2">No Result Recorded</h3>
                  <p className="text-blue-700 text-sm">
                    This match doesn't have a recorded result yet.
                    {canRecordResult() && " You can record the result using the button below."}
                  </p>
                </div>
              </div>
            )
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 px-6 py-4 flex justify-between">
          {canRecordResult() && (
            <Button 
              onClick={handleRecordResult}
              variant={match.status === 'completed' ? "outline" : "default"}
              className={match.status === 'completed' ? "" : "bg-green-600 hover:bg-green-700"}
            >
              <Edit className="w-4 h-4 mr-2" />
              {match.status === 'completed' ? 'Edit Result' : 'Record Result'}
            </Button>
          )}
          
          {!canRecordResult() && (
            <div className="w-full text-sm text-muted-foreground text-center">
              {match.status === 'completed' 
                ? "Results have been recorded for this match."
                : "Only administrators, league organizers, or participating players can record results."}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default withAuth(MatchDetailsPage);
