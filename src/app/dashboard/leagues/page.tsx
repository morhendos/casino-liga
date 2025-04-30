"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Calendar, Users, Share2, Clock, MapPin, Medal, Tag, AlertCircle, ChevronRight, Info } from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import withAuth from "@/components/auth/withAuth";
import { isAdmin as isAdminHelper } from "@/lib/auth/role-utils";
import { ShareLeagueButton } from "@/components/leagues";
import { cn } from "@/lib/utils";
import { SkewedButton } from "@/components/ui/SkewedButton";

interface League {
  id: string;
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  minTeams: number;
  teams: any[];
  matchFormat: string;
  venue?: string;
  status: string;
  banner?: string;
  scheduleGenerated: boolean;
  pointsPerWin: number;
  pointsPerLoss: number;
  organizer: any;
  isPublic?: boolean;
}

interface Team {
  id: string;
  name: string;
  players?: any[];
}

function LeaguesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeLeagues, setActiveLeagues] = useState<League[]>([]);
  const [pastLeagues, setPastLeagues] = useState<League[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("my");
  const [playerActiveTab, setPlayerActiveTab] = useState("active");
  
  // Initialize selectedTeamId from URL if present
  useEffect(() => {
    const teamId = searchParams.get("teamId");
    if (teamId) {
      setSelectedTeamId(teamId);
    }
  }, [searchParams]);
  
  // Wait for session to be loaded, then check admin status and fetch appropriate data
  useEffect(() => {
    // Skip if session is still loading
    if (sessionStatus === "loading") return;
    
    // Skip if no user is logged in
    if (!session?.user?.id) return;
    
    // Check if user is admin
    const userIsAdmin = session.user.roles && Array.isArray(session.user.roles) && 
                      session.user.roles.some(role => role.id === '2');
    
    // Set admin status
    setIsAdmin(userIsAdmin);
    
    // Fetch leagues and teams
    fetchData(userIsAdmin, session.user.id);
  }, [session, sessionStatus]);
  
  // Main data fetching function
  const fetchData = async (userIsAdmin: boolean, userId: string) => {
    try {
      setIsLoading(true);
      
      if (userIsAdmin) {
        // Admin view: fetch all leagues
        await fetchAdminLeagues(userId);
      } else {
        // Player view: fetch leagues the player is in
        await fetchPlayerLeagues();
      }
      
      // Fetch user's teams (for all users)
      await fetchUserTeams(userId);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load leagues data");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch leagues for admin users
  const fetchAdminLeagues = async (userId: string) => {
    try {
      // Fetch leagues where the user is organizer
      const myResponse = await fetch(`/api/leagues?organizer=${userId}`);
      if (!myResponse.ok) {
        throw new Error(`Failed to fetch your leagues: ${myResponse.statusText}`);
      }
      
      const myData = await myResponse.json();
      
      if (myData.leagues) {
        // Ensure each league has an id property
        const processedMyLeagues = myData.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setMyLeagues(processedMyLeagues);
      }
      
      // Fetch active leagues (registration or active status)
      const activeResponse = await fetch('/api/leagues?active=true');
      if (!activeResponse.ok) {
        throw new Error(`Failed to fetch active leagues: ${activeResponse.statusText}`);
      }
      
      const activeData = await activeResponse.json();
      
      if (activeData.leagues) {
        // Ensure each league has an id property
        const processedActiveLeagues = activeData.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setActiveLeagues(processedActiveLeagues);
      }
      
      // Fetch past leagues (completed status)
      const pastResponse = await fetch('/api/leagues?status=completed');
      if (!pastResponse.ok) {
        throw new Error(`Failed to fetch past leagues: ${pastResponse.statusText}`);
      }
      
      const pastData = await pastResponse.json();
      
      if (pastData.leagues) {
        // Ensure each league has an id property
        const processedPastLeagues = pastData.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setPastLeagues(processedPastLeagues);
      }
    } catch (error) {
      console.error("Error fetching admin leagues:", error);
      throw error; // Rethrow for the main handler
    }
  };
  
  // Fetch leagues for regular players
  const fetchPlayerLeagues = async () => {
    try {
      // Fetch the player's active leagues
      const activeResponse = await fetch('/api/players/leagues?active=true');
      if (!activeResponse.ok) {
        throw new Error(`Failed to fetch active leagues: ${activeResponse.statusText}`);
      }
      
      const activeData = await activeResponse.json();

      if (activeData.leagues) {
        // Ensure each league has an id property
        const processedActiveLeagues = activeData.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setActiveLeagues(processedActiveLeagues);
      }

      // Fetch past leagues (completed)
      const pastResponse = await fetch('/api/players/leagues?status=completed');
      if (!pastResponse.ok) {
        throw new Error(`Failed to fetch past leagues: ${pastResponse.statusText}`);
      }
      
      const pastData = await pastResponse.json();

      if (pastData.leagues) {
        // Ensure each league has an id property
        const processedPastLeagues = pastData.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setPastLeagues(processedPastLeagues);
      }
    } catch (error) {
      console.error("Error fetching player leagues:", error);
      throw error; // Rethrow for the main handler
    }
  };
  
  // Fetch teams for any user
  const fetchUserTeams = async (userId: string) => {
    try {
      // Get the player profile for this user
      const playerResponse = await fetch(`/api/players?userId=${userId}`);
      if (!playerResponse.ok) {
        throw new Error(`Failed to fetch player data: ${playerResponse.statusText}`);
      }
      
      const playerData = await playerResponse.json();
      
      if (playerData.players && playerData.players.length > 0) {
        const playerId = playerData.players[0].id || playerData.players[0]._id;
        
        // Fetch teams for this player
        const teamsResponse = await fetch(`/api/teams?playerId=${playerId}`);
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.statusText}`);
        }
        
        const teamsData = await teamsResponse.json();
        
        if (teamsData.teams) {
          // Ensure each team has an id property
          const processedTeams = teamsData.teams.map((team: any) => ({
            ...team,
            id: team._id || team.id
          }));
          setMyTeams(processedTeams);
        }
      }
    } catch (error) {
      console.error("Error fetching user teams:", error);
      throw error; // Rethrow for the main handler
    }
  };
  
  // Get appropriate color for league status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "from-green-600 to-emerald-500";
      case 'registration':
        return "from-blue-600 to-indigo-500";
      case 'completed':
        return "from-purple-600 to-violet-500";
      default:
        return "from-gray-600 to-gray-500";
    }
  };

  // Get status badge content
  const getStatusBadge = (status: string) => {
    let bgColor, textColor, icon;
    
    switch (status) {
      case 'active':
        bgColor = "bg-emerald-500/20";
        textColor = "text-emerald-400";
        icon = <Trophy className="h-3.5 w-3.5 mr-1.5" />;
        break;
      case 'registration':
        bgColor = "bg-blue-500/20";
        textColor = "text-blue-400";
        icon = <Users className="h-3.5 w-3.5 mr-1.5" />;
        break;
      case 'completed':
        bgColor = "bg-purple-500/20";
        textColor = "text-purple-400";
        icon = <Medal className="h-3.5 w-3.5 mr-1.5" />;
        break;
      default:
        bgColor = "bg-gray-500/20";
        textColor = "text-gray-400";
        icon = <Info className="h-3.5 w-3.5 mr-1.5" />;
    }
    
    return (
      <div className={`inline-flex items-center px-2.5 py-1 rounded-md ${bgColor} ${textColor} text-xs font-medium border border-${textColor}/30`}>
        {icon}
        {status === 'active' ? 'Active' : 
         status === 'registration' ? 'Registration' : 
         status === 'completed' ? 'Completed' : 'Unknown'}
      </div>
    );
  };

  // Get public badge
  const getPublicBadge = (isPublic: boolean = false) => {
    if (!isPublic) return null;
    
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-pink-500/20 text-pink-400 text-xs font-medium border border-pink-400/30">
        <Share2 className="h-3.5 w-3.5 mr-1.5" />
        Public
      </div>
    );
  };
  
  function LeagueCard({ league }: { league: League }) {
    const isRegistrationOpen = 
      league.status === 'registration' && 
      league.registrationDeadline && new Date(league.registrationDeadline) > new Date();
    
    const isUserOrganizer = league.organizer && league.organizer.id === session?.user?.id;
    
    // Check if user's team is in this league
    const userTeamInLeague = selectedTeamId && league.teams.some(team => team.id === selectedTeamId);
    
    // For player view, find user's team in this league
    const userTeam = !isAdmin && league.teams.find(team =>
      team.players && team.players.some((player: any) =>
        player.userId === session?.user?.id
      )
    );
    
    // Check if league is full
    const isLeagueFull = league.teams.length >= league.maxTeams;
    
    // Ensure the league ID is available
    const leagueId = league.id || league._id;
    
    // Format registration deadline safely with proper error handling
    const formattedDeadline = (() => {
      try {
        if (!league.registrationDeadline) return "Not set";
        const deadline = new Date(league.registrationDeadline);
        // Check if date is valid
        if (isNaN(deadline.getTime())) return "Invalid date";
        return formatDistance(deadline, new Date(), { addSuffix: true });
      } catch (error) {
        console.error("Error formatting deadline:", error);
        return "Invalid date";
      }
    })();

    // Calculate percentage of teams registered
    const teamsPercentage = Math.min(100, Math.round((league.teams.length / league.maxTeams) * 100));

    // Format date safely
    const formatDateSafely = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleDateString();
      } catch (error) {
        return "Invalid Date";
      }
    };
    
    // Format date range
    const formatDateRange = () => {
      const startDateStr = formatDateSafely(league.startDate);
      const endDateStr = formatDateSafely(league.endDate);
      
      if (startDateStr === "Invalid Date" || endDateStr === "Invalid Date") {
        return "Invalid Date - Invalid Date";
      }
      
      return `${startDateStr} - ${endDateStr}`;
    };
    
    return (
      <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Gradient accent line at top */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getStatusColor(league.status)}`}></div>
        
        {/* Decorative background elements */}
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-blue-500/5 blur-xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 rounded-full bg-purple-500/5 blur-xl"></div>
        
        {/* Header Section */}
        <div className="p-5 border-b border-gray-800/60">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {league.name}
            </h3>
            <div className="flex gap-2">
              {getStatusBadge(league.status)}
              {league.isPublic && getPublicBadge(true)}
            </div>
          </div>
          
          <p className="text-gray-400 text-sm line-clamp-2">
            {league.description || "No description provided"}
          </p>
        </div>
        
        {/* Content Section */}
        <div className="p-5 flex-grow">
          {/* Teams progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center">
                <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                Teams
              </span>
              <span className="text-white font-medium">{league.teams.length} / {league.maxTeams}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getStatusColor(league.status)}`} 
                style={{ width: `${teamsPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* League Info Cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center text-gray-400 mb-1 text-xs">
                <Calendar className="h-3 w-3 mr-1.5 text-blue-400" />
                Schedule
              </div>
              <div className="text-white text-sm font-medium">
                {formatDateRange()}
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center text-gray-400 mb-1 text-xs">
                <Tag className="h-3 w-3 mr-1.5 text-amber-400" />
                Format
              </div>
              <div className="text-white text-sm font-medium">
                {league.matchFormat === 'bestOf3' ? 'Best of 3 Sets' : 
                 league.matchFormat === 'bestOf5' ? 'Best of 5 Sets' : 
                 league.matchFormat === 'singleSet' ? 'Single Set' : 
                 league.matchFormat}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="p-5 border-t border-gray-800/60 flex justify-between items-center">
          <Link 
            href={`/dashboard/leagues/${leagueId}`}
            className={cn(
              "flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            )}
          >
            <span className="text-sm font-medium">View Details</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          
          <div className="flex gap-2">
            {isRegistrationOpen && selectedTeamId && !userTeamInLeague && !isLeagueFull && (
              <Link href={`/dashboard/leagues/${leagueId}/join?teamId=${selectedTeamId}`}>
                <SkewedButton
                  buttonVariant="teal"
                  buttonSize="sm"
                  hoverEffectColor="teal"
                  hoverEffectVariant="solid"
                  className="text-xs"
                >
                  Join League
                </SkewedButton>
              </Link>
            )}
            
            {(userTeamInLeague || userTeam) && (
              <Link href={`/dashboard/leagues/${leagueId}/schedule`}>
                <SkewedButton
                  buttonVariant="outline"
                  buttonSize="sm"
                  hoverEffectColor="blue"
                  hoverEffectVariant="outline"
                  className="text-xs"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  Schedule
                </SkewedButton>
              </Link>
            )}
            
            {isUserOrganizer && (
              <Link href={`/dashboard/leagues/${leagueId}/manage`}>
                <SkewedButton
                  buttonVariant="orange"
                  buttonSize="sm"
                  hoverEffectColor="orange"
                  hoverEffectVariant="solid"
                  className="text-xs"
                >
                  Manage
                </SkewedButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Empty State Component
  function EmptyState({ 
    title, 
    description, 
    actionText, 
    actionLink, 
    icon = <Trophy className="w-8 h-8 text-padeliga-purple" /> 
  }) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl p-8 text-center">
        {/* Decorative background elements */}
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-padeliga-purple/10 blur-xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-padeliga-teal/10 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gray-800/50 mb-6 backdrop-blur-sm">
            {icon}
          </div>
          
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {title}
          </h3>
          
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {description}
          </p>
          
          {actionText && actionLink && (
            <SkewedButton
              buttonVariant="teal"
              buttonSize="lg"
              className="mx-auto"
              asChild
            >
              <Link href={actionLink}>
                <Plus className="w-4 h-4 mr-2" />
                {actionText}
              </Link>
            </SkewedButton>
          )}
        </div>
      </div>
    );
  }
  
  // Enhanced Skeleton Loading
  function LoadingSkeleton() {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-lg bg-gray-900/60 border border-gray-800/40 shadow-xl h-[300px] animate-pulse">
            <div className="h-1 bg-gradient-to-r from-gray-600 to-gray-500 w-full"></div>
            
            <div className="p-5 border-b border-gray-800/40">
              <div className="h-6 bg-gray-800 rounded-md w-2/3 mb-3"></div>
              <div className="h-4 bg-gray-800 rounded-md w-full"></div>
            </div>
            
            <div className="p-5">
              <div className="h-4 bg-gray-800 rounded-md w-full mb-2"></div>
              <div className="h-2 bg-gray-800 rounded-full w-full mb-6"></div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="h-16 bg-gray-800/50 rounded-lg"></div>
                <div className="h-16 bg-gray-800/50 rounded-lg"></div>
              </div>
            </div>
            
            <div className="absolute bottom-0 w-full p-5 border-t border-gray-800/40">
              <div className="flex justify-between">
                <div className="h-8 bg-gray-800 rounded-md w-24"></div>
                <div className="h-8 bg-gray-800 rounded-md w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (sessionStatus === "loading") {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-800 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-800 rounded w-full max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Geometric background elements */}
      <div className="fixed inset-0 -z-10 opacity-5 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-padeliga-purple rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-12 w-72 h-72 bg-padeliga-teal rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-padeliga-orange rounded-full blur-3xl"></div>
      </div>
      
      {/* Header with skewed background */}
      <div className="relative mb-8 overflow-hidden rounded-md">
        <div 
          className="absolute inset-0 -z-10 bg-gradient-to-r from-padeliga-teal to-padeliga-blue opacity-20"
          style={{ transform: 'skew(-4deg) scale(1.1)' }}
        />
        <div className="py-8 px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold heading-accent mb-2">
                {isAdmin ? "Leagues Management" : "My Leagues"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin 
                  ? "Create, manage and track all your padel leagues in one place" 
                  : "Join leagues, track your matches and follow the rankings"
                }
              </p>
            </div>
            
            <div>
              {isAdmin ? (
                <SkewedButton
                  buttonVariant="teal"
                  buttonSize="lg"
                  hoverEffectColor="teal"
                  className="relative"
                  asChild
                >
                  <Link href="/dashboard/leagues/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create League
                  </Link>
                </SkewedButton>
              ) : (
                <SkewedButton
                  buttonVariant="outline"
                  buttonSize="lg"
                  hoverEffectColor="teal"
                  hoverEffectVariant="outline"
                  className="border-2 border-padeliga-teal text-padeliga-teal"
                  asChild
                >
                  <Link href="/dashboard/teams">
                    <Users className="w-4 h-4 mr-2" />
                    My Teams
                  </Link>
                </SkewedButton>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Tabs Section with more spacing and better styling */}
      <div className="relative overflow-hidden rounded-lg bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 shadow-xl mb-8">
        {/* Admin specific tabs */}
        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 rounded-md">
              <TabsTrigger 
                value="my"
                className={cn(
                  "rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all p-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>My Leagues</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className={cn(
                  "rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all p-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Active Leagues</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className={cn(
                  "rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all p-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  <span>Past Leagues</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Tab content for admin view */}
            <TabsContent value="my" className="pt-3 px-1 pb-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : myLeagues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myLeagues.map(league => (
                    <LeagueCard key={league.id || league._id} league={league} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Leagues Created"
                  description="You haven't created any leagues yet. Start by creating your first padel league."
                  actionText="Create Your First League"
                  actionLink="/dashboard/leagues/create"
                  icon={<Trophy className="w-8 h-8 text-padeliga-teal" />}
                />
              )}
            </TabsContent>
            
            <TabsContent value="active" className="pt-3 px-1 pb-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : activeLeagues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeLeagues.map(league => (
                    <LeagueCard key={league.id || league._id} league={league} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Active Leagues"
                  description="There are currently no active leagues available to join."
                  actionText="Create a League"
                  actionLink="/dashboard/leagues/create"
                  icon={<AlertCircle className="w-8 h-8 text-padeliga-orange" />}
                />
              )}
            </TabsContent>
            
            <TabsContent value="past" className="pt-3 px-1 pb-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : pastLeagues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastLeagues.map(league => (
                    <LeagueCard key={league.id || league._id} league={league} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Past Leagues"
                  description="There are no completed leagues in your history."
                  icon={<Medal className="w-8 h-8 text-gray-500" />}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          /* Player specific tabs */
          <Tabs value={playerActiveTab} onValueChange={setPlayerActiveTab} className="p-1">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 p-1 rounded-md">
              <TabsTrigger 
                value="active"
                className={cn(
                  "rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all p-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Active Leagues</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className={cn(
                  "rounded-md data-[state=active]:bg-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md",
                  "transition-all p-3"
                )}
              >
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  <span>Past Leagues</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* TabsContent must be direct children of Tabs */}
            <TabsContent value="active" className="pt-3 px-1 pb-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : activeLeagues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeLeagues.map(league => (
                    <LeagueCard key={league.id || league._id} league={league} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Active Leagues"
                  description="You're not currently participating in any active leagues."
                  actionText="Create or Join a Team"
                  actionLink="/dashboard/teams"
                  icon={<Users className="w-8 h-8 text-padeliga-teal" />}
                />
              )}
            </TabsContent>
            
            <TabsContent value="past" className="pt-3 px-1 pb-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : pastLeagues.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastLeagues.map(league => (
                    <LeagueCard key={league.id || league._id} league={league} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Past Leagues"
                  description="You have no completed leagues in your history."
                  icon={<Medal className="w-8 h-8 text-gray-500" />}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

// Use standard withAuth instead of withRoleAuth to allow both admins and players
export default withAuth(LeaguesPage);