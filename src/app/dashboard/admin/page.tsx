"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { UserCircle, UsersRound, Trophy, UserCog, Mail, ShieldCheck, Settings, BarChart, Users, Calendar } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { LeagueManagement } from "@/components/admin/LeagueManagement";
import { PlayerManagement } from "@/components/admin/PlayerManagement";
import PlayerInvitationManagement from "@/components/admin/PlayerInvitationManagement";
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import { DashboardStats, StatItem } from "@/components/dashboard";

function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [players, setPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  
  // Stats data (could be fetched from an API in a real application)
  const statsData = [
    {
      title: "Total Users",
      value: "42",
      icon: Users,
      color: "padeliga-purple",
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: "Active Leagues",
      value: "7",
      icon: Trophy,
      color: "padeliga-teal"
    },
    {
      title: "Scheduled Matches",
      value: "28",
      icon: Calendar,
      color: "padeliga-orange"
    },
    {
      title: "Total Players",
      value: "124",
      icon: UserCog,
      color: "padeliga-green"
    }
  ];

  useEffect(() => {
    // Load players for the invitation tab
    if (activeTab === "invitations") {
      fetchPlayers();
    }
  }, [activeTab]);

  const fetchPlayers = async () => {
    try {
      setIsLoadingPlayers(true);
      const response = await fetch('/api/admin/players');
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const handleInviteSent = async (player) => {
    // Refresh the player list after invitation
    await fetchPlayers();
  };

  const handleCreatePlayer = async (playerData) => {
    try {
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: playerData.nickname,
          email: playerData.email,
          skillLevel: 5, // Default value
          handedness: 'right', // Default value
          preferredPosition: 'both', // Default value
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create player');
      }

      const newPlayer = await response.json();
      
      // Refresh player list
      await fetchPlayers();
      
      return newPlayer;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 relative">
      {/* Background with subtle pattern */}
      <GeometricBackground variant="subtle" animated={false} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight heading-accent inline-block">
            Admin Dashboard
          </h1>
          <p className="text-xl mt-4 text-muted-foreground">
            Manage users, players, leagues, and platform settings
          </p>
        </div>

        {/* Dashboard overview tab with stats */}
        <Tabs
          defaultValue="dashboard"
          className="space-y-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="bg-paper border-b border-border p-1 sticky top-0 z-20">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
              <TabsTrigger value="dashboard" className="px-4 py-2">
                <BarChart className="h-4 w-4 mr-2 text-padeliga-teal" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="px-4 py-2">
                <UsersRound className="h-4 w-4 mr-2 text-padeliga-purple" />
                Users
              </TabsTrigger>
              <TabsTrigger value="players" className="px-4 py-2">
                <UserCog className="h-4 w-4 mr-2 text-padeliga-green" />
                Players
              </TabsTrigger>
              <TabsTrigger value="invitations" className="px-4 py-2">
                <Mail className="h-4 w-4 mr-2 text-padeliga-orange" />
                Invitations
              </TabsTrigger>
              <TabsTrigger value="roles" className="px-4 py-2">
                <ShieldCheck className="h-4 w-4 mr-2 text-padeliga-red" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="leagues" className="px-4 py-2">
                <Trophy className="h-4 w-4 mr-2 text-padeliga-teal" />
                Leagues
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
              <DashboardStats stats={statsData} />
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader className="bg-muted/20">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions and events on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                <div className="py-4 flex items-center">
                  <div className="p-2 bg-padeliga-green/10 mr-4">
                    <UserCog className="h-5 w-5 text-padeliga-green" />
                  </div>
                  <div>
                    <p className="font-medium">New player registered</p>
                    <p className="text-sm text-muted-foreground">Juan Martínez created a player profile</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    2 hours ago
                  </div>
                </div>
                
                <div className="py-4 flex items-center">
                  <div className="p-2 bg-padeliga-teal/10 mr-4">
                    <Trophy className="h-5 w-5 text-padeliga-teal" />
                  </div>
                  <div>
                    <p className="font-medium">League status updated</p>
                    <p className="text-sm text-muted-foreground">Summer League status changed to Active</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    5 hours ago
                  </div>
                </div>
                
                <div className="py-4 flex items-center">
                  <div className="p-2 bg-padeliga-orange/10 mr-4">
                    <Calendar className="h-5 w-5 text-padeliga-orange" />
                  </div>
                  <div>
                    <p className="font-medium">Match results submitted</p>
                    <p className="text-sm text-muted-foreground">Team Aces vs Team Eagles - 6-4, 6-3</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    Yesterday
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Access */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-padeliga-purple">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <UsersRound className="h-5 w-5 mr-2 text-padeliga-purple" />
                      Manage Users
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add, edit, or remove platform users and their permissions
                    </p>
                    <button 
                      className="text-sm text-padeliga-purple flex items-center"
                      onClick={() => setActiveTab("users")}
                    >
                      User Management
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-padeliga-teal">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-padeliga-teal" />
                      League Management
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create, configure and monitor leagues and tournaments
                    </p>
                    <button 
                      className="text-sm text-padeliga-teal flex items-center"
                      onClick={() => setActiveTab("leagues")}
                    >
                      Manage Leagues
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </CardContent>
                </Card>
                
                <Card className="border-l-4 border-l-padeliga-green">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center">
                      <UserCog className="h-5 w-5 mr-2 text-padeliga-green" />
                      Player Management
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage player profiles, send invitations, and assign teams
                    </p>
                    <button 
                      className="text-sm text-padeliga-green flex items-center"
                      onClick={() => setActiveTab("players")}
                    >
                      Manage Players
                      <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 border-t-4 border-t-padeliga-purple shadow-sm">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <UsersRound className="h-5 w-5 mr-2 text-padeliga-purple" />
                  User Management
                </CardTitle>
                <CardDescription>
                  View and manage all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players">
            <Card className="border-0 border-t-4 border-t-padeliga-green shadow-sm">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <UserCog className="h-5 w-5 mr-2 text-padeliga-green" />
                  Player Management
                </CardTitle>
                <CardDescription>
                  Create and manage player profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card className="border-0 border-t-4 border-t-padeliga-orange shadow-sm">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-padeliga-orange" />
                  Player Invitations
                </CardTitle>
                <CardDescription>
                  Invite players to join the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center py-8">
                    <p>Loading players...</p>
                  </div>
                ) : (
                  <PlayerInvitationManagement 
                    players={players} 
                    onInviteSent={handleInviteSent}
                    onCreatePlayer={handleCreatePlayer}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="border-0 border-t-4 border-t-padeliga-red shadow-sm">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-padeliga-red" />
                  Role Management
                </CardTitle>
                <CardDescription>
                  Assign and manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leagues">
            <Card className="border-0 border-t-4 border-t-padeliga-teal shadow-sm">
              <CardHeader className="bg-muted/20">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-padeliga-teal" />
                  League Management
                </CardTitle>
                <CardDescription>
                  Manage leagues, tournaments, and team assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeagueManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default withRoleAuth(AdminDashboard, [ROLES.ADMIN]);
