"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users2, 
  CalendarDays, 
  Settings, 
  Trophy, 
  ClipboardList, 
  Clock,
  MapPin,
  AlertTriangle,
  BarChart
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";
import MatchHistoryList from "@/components/matches/MatchHistoryList";
import LeagueRankingsTable from "@/components/league/LeagueRankingsTable";
import ShareLeagueButton from "@/components/leagues/ShareLeagueButton";

interface Team {
  id: string;
  name: string;
  players: any[];
}

interface League {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxTeams: number;
  minTeams: number;
  teams: Team[];
  scheduleGenerated: boolean;
  status: string;
  venue?: string;
  organizer: any;
  isPublic?: boolean;
}

function LeagueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  
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
            id: team._id || team.id
          })) || []
        };
        
        setLeague(processedLeague);
        
        // Check if user is the organizer
        if (session && processedLeague.organizer && session.user) {
          const organizerId = typeof processedLeague.organizer === 'object' 
            ? (processedLeague.organizer._id || processedLeague.organizer.id) 
            : processedLeague.organizer;
            
          setIsOrganizer(organizerId === session.user.id);
        }
      } catch (error) {
        console.error("Error fetching league details:", error);
        setError("Failed to load league details");
        toast.error("Failed to load league details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagueDetails();
  }, [leagueId, session]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'registration':
        return <Badge variant="secondary">Registration Open</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const canManageLeague = () => {
    return isAdmin || isOrganizer;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
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
  
  if (!league) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>League Not Found</CardTitle>
            <CardDescription>
              The league you're looking for does not exist or has been deleted.
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{league.name}</h1>
            {getStatusBadge(league.status)}
          </div>
          {league.description && (
            <p className="text-muted-foreground">{league.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canManageLeague() && (
            <Button asChild>
              <Link href={`/dashboard/leagues/${leagueId}/manage`}>
                <Settings className="w-4 h-4 mr-2" />
                Manage League
              </Link>
            </Button>
          )}
          
          {/* Analytics button */}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/leagues/${leagueId}/analytics`}>
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Link>
          </Button>

          {/* Share button */}
          <ShareLeagueButton leagueId={leagueId} isPublic={league.isPublic !== false} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>League Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">{getStatusBadge(league.status)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Teams</dt>
                  <dd className="mt-1">
                    {league.teams.length} / {league.maxTeams}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                  <dd className="mt-1 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(league.startDate)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                  <dd className="mt-1 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatDate(league.endDate)}
                  </dd>
                </div>
                
                {league.registrationDeadline && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Registration Deadline</dt>
                    <dd className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDate(league.registrationDeadline)}
                    </dd>
                  </div>
                )}
                
                {league.venue && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Venue</dt>
                    <dd className="mt-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {league.venue}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Visibility</dt>
                  <dd className="mt-1">
                    {league.isPublic !== false ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Private
                      </Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/leagues/${leagueId}/teams`}>
                  <Users2 className="w-4 h-4 mr-2" />
                  View Teams
                </Link>
              </Button>
              
              <Button 
                asChild
                disabled={!league.scheduleGenerated}
                variant={league.scheduleGenerated ? "default" : "outline"}
              >
                <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {league.scheduleGenerated ? 'View Schedule' : 'No Schedule Yet'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="matches">
            <TabsList className="mb-4">
              <TabsTrigger value="matches">
                <ClipboardList className="w-4 h-4 mr-2" />
                Recent Matches
              </TabsTrigger>
              <TabsTrigger value="rankings">
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="matches">
              {league.scheduleGenerated ? (
                <MatchHistoryList 
                  leagueId={leagueId}
                  title="Recent Matches"
                  description="Latest matches in this league"
                  limit={5}
                  showViewAllButton={true}
                />
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      <p className="mb-2">No schedule has been generated for this league yet.</p>
                      {canManageLeague() && (
                        <Button 
                          asChild
                          variant="outline" 
                          className="mt-2"
                        >
                          <Link href={`/dashboard/leagues/${leagueId}/schedule?tab=generate`}>
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Generate Schedule
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="rankings">
              <LeagueRankingsTable 
                leagueId={leagueId}
                title="Current Standings"
                description="Team rankings in this league"
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teams</CardTitle>
              <CardDescription>
                {league.teams.length} of {league.maxTeams} teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              {league.teams.length > 0 ? (
                <div className="space-y-2">
                  {league.teams.slice(0, 5).map(team => (
                    <div key={team.id} className="flex items-center p-2 border rounded-md">
                      <Users2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>{team.name}</span>
                    </div>
                  ))}
                  
                  {league.teams.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      +{league.teams.length - 5} more teams
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No teams have joined this league yet.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/dashboard/leagues/${leagueId}/teams`}>
                  <Users2 className="w-4 h-4 mr-2" />
                  View All Teams
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/leagues/${leagueId}/matches`}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Match History
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/leagues/${leagueId}/rankings`}>
                  <Trophy className="w-4 h-4 mr-2" />
                  League Standings
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                disabled={!league.scheduleGenerated}
                asChild={league.scheduleGenerated ? true : false}
              >
                <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Schedule
                </Link>
              </Button>
              
              {/* Analytics quick link */}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/leagues/${leagueId}/analytics`}>
                  <BarChart className="w-4 h-4 mr-2" />
                  Analytics & Reports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(LeagueDetailsPage);
