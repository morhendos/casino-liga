"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { 
  UserCircle, 
  UsersRound, 
  Trophy, 
  UserCog, 
  Mail, 
  ShieldCheck, 
  Settings, 
  BarChart,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  CalendarDays
} from "lucide-react";
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import {
  UserManagement,
  PlayerManagement,
  PlayerInvitationManagement,
  RoleManagement,
  LeagueManagement
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";

function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [players, setPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const response = await fetch("/api/admin/players");
        const data = await response.json();
        setPlayers(data.players || []);
      } catch (error) {
        console.error("Failed to fetch players:", error);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    if (activeTab === "invitations") {
      fetchPlayers();
    }
  }, [activeTab]);

  const handleCreatePlayer = async (playerData: any) => {
    try {
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create player");
      }

      // Refetch players to update the list
      const updatedPlayersResponse = await fetch("/api/admin/players");
      const updatedPlayersData = await updatedPlayersResponse.json();
      setPlayers(updatedPlayersData.players || []);

      return { success: true };
    } catch (error) {
      console.error("Error creating player:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const getTabIcon = (tabId: string) => {
    const icons: Record<string, React.ElementType> = {
      dashboard: BarChart,
      users: UsersRound,
      players: UserCog,
      invitations: Mail,
      roles: ShieldCheck,
      leagues: Trophy,
      settings: Settings,
    };
    
    return icons[tabId] || BarChart;
  };
  
  // Platform stats - would be fetched from API in real app
  const platformStats = [
    { title: "Total Users", value: "185", icon: Users, color: "padeliga-purple" },
    { title: "Leagues", value: "23", icon: Trophy, color: "padeliga-teal" },
    { title: "Matches", value: "156", icon: Activity, color: "padeliga-orange" },
    { title: "Active Players", value: "142", icon: UserCog, color: "padeliga-green" }
  ];
  
  // Recent alerts - would be fetched from API in real app
  const recentAlerts = [
    { 
      title: "Match Results Not Submitted", 
      description: "5 matches from last week have no results",
      type: "warning",
      icon: AlertCircle
    },
    { 
      title: "League Registration Closing", 
      description: "Spring League registration closes tomorrow",
      type: "info",
      icon: CalendarDays
    },
    { 
      title: "System Update Completed", 
      description: "Platform updated to version 2.3.1",
      type: "success",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen transition-colors duration-200 relative">
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight heading-accent inline-block mb-1">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage users, players, leagues, and platform settings
          </p>
        </div>

        {/* Dashboard tabs with improved styling */}
        <Tabs
          defaultValue="dashboard"
          className="space-y-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="bg-card/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-border p-1 sticky top-0 z-20">
            <TabsList className="grid grid-cols-2 md:grid-cols-7 w-full">
              {["dashboard", "users", "players", "invitations", "roles", "leagues", "settings"].map((tab) => {
                const Icon = getTabIcon(tab);
                const isActive = activeTab === tab;
                return (
                  <TabsTrigger 
                    key={tab} 
                    value={tab} 
                    className={`px-3 py-2 capitalize flex items-center gap-1.5 justify-center ${isActive ? 'text-padeliga-teal' : ''}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-padeliga-teal' : ''}`} />
                    <span className="hidden sm:inline">{tab}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Admin Dashboard Overview */}
            <div className="grid grid-cols-1 gap-6">
              {/* Platform Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platformStats.map((stat, index) => (
                  <Card key={index} className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40 border-t-4" style={{borderTopColor: `hsl(var(--${stat.color}))`}}>
                    <CardContent className="p-4 flex flex-col items-center md:items-start">
                      <div className="mt-2 flex items-center md:items-start gap-3 md:flex-col">
                        <stat.icon className={`h-8 w-8 md:mb-2 text-${stat.color}`} />
                        <div className="flex flex-col md:items-start">
                          <p className="text-3xl font-bold">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Main Dashboard Content */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Admin Quick Actions */}
                <Card className="md:col-span-2 bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="bg-transparent border border-padeliga-teal/30 hover:border-padeliga-teal hover:bg-padeliga-teal/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <UsersRound className="h-8 w-8 mb-2 text-padeliga-teal" />
                        <h3 className="font-medium">Manage Users</h3>
                        <p className="text-xs text-muted-foreground mt-1">Add, edit or remove users</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border border-padeliga-purple/30 hover:border-padeliga-purple hover:bg-padeliga-purple/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Trophy className="h-8 w-8 mb-2 text-padeliga-purple" />
                        <h3 className="font-medium">Create League</h3>
                        <p className="text-xs text-muted-foreground mt-1">Set up a new league</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border border-padeliga-orange/30 hover:border-padeliga-orange hover:bg-padeliga-orange/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Mail className="h-8 w-8 mb-2 text-padeliga-orange" />
                        <h3 className="font-medium">Send Invites</h3>
                        <p className="text-xs text-muted-foreground mt-1">Invite new players</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border border-padeliga-green/30 hover:border-padeliga-green hover:bg-padeliga-green/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <ShieldCheck className="h-8 w-8 mb-2 text-padeliga-green" />
                        <h3 className="font-medium">Manage Roles</h3>
                        <p className="text-xs text-muted-foreground mt-1">Update user permissions</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border border-padeliga-teal/30 hover:border-padeliga-teal hover:bg-padeliga-teal/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <BarChart className="h-8 w-8 mb-2 text-padeliga-teal" />
                        <h3 className="font-medium">View Reports</h3>
                        <p className="text-xs text-muted-foreground mt-1">Platform analytics</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-transparent border border-padeliga-purple/30 hover:border-padeliga-purple hover:bg-padeliga-purple/5 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Settings className="h-8 w-8 mb-2 text-padeliga-purple" />
                        <h3 className="font-medium">Settings</h3>
                        <p className="text-xs text-muted-foreground mt-1">Configure platform</p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
                
                {/* System Alerts */}
                <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle>System Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {recentAlerts.map((alert, index) => {
                        const alertColors: Record<string, string> = {
                          warning: "bg-padeliga-orange text-padeliga-orange",
                          info: "bg-padeliga-teal text-padeliga-teal",
                          success: "bg-padeliga-green text-padeliga-green"
                        };
                        const color = alertColors[alert.type] || "bg-padeliga-purple text-padeliga-purple";
                        
                        return (
                          <div key={index} className="p-4 flex items-start">
                            <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${color.split(" ")[1]} bg-opacity-10 mr-3`}>
                              <alert.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">{alert.title}</h3>
                              <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
                <CardHeader className="pb-2 border-b">
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-border">
                    {[
                      { time: "10 min ago", title: "New user registered", desc: "John Smith created an account", icon: UserCircle, color: "padeliga-purple" },
                      { time: "45 min ago", title: "League created", desc: "Summer League 2025 was created", icon: Trophy, color: "padeliga-teal" },
                      { time: "2 hours ago", title: "Match result submitted", desc: "Team Alpha vs Team Beta: 6-4, 7-5", icon: Activity, color: "padeliga-orange" },
                      { time: "Yesterday", title: "User role updated", desc: "Maria Garcia promoted to admin", icon: ShieldCheck, color: "padeliga-green" }
                    ].map((item, i) => (
                      <div key={i} className="mb-6 last:mb-0">
                        <div className={`absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-${item.color}/20 text-${item.color} -translate-x-1/2`}>
                          <item.icon className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground">{item.time}</span>
                          <span className="font-medium">{item.title}</span>
                          <span className="text-sm">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <UsersRound className="h-5 w-5 mr-2 text-padeliga-purple" />
                  <span>User Management</span>
                  <Badge variant="outline" className="ml-auto">Manage Users</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <UserCog className="h-5 w-5 mr-2 text-padeliga-green" />
                  <span>Player Management</span>
                  <Badge variant="outline" className="ml-auto">Manage Players</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <PlayerManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-padeliga-orange" />
                  <span>Player Invitations</span>
                  <Badge variant="outline" className="ml-auto">Invite Players</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center py-8">
                    <p>Loading players...</p>
                  </div>
                ) : (
                  <PlayerInvitationManagement
                    players={players}
                    onCreatePlayer={handleCreatePlayer}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-padeliga-red" />
                  <span>Role Management</span>
                  <Badge variant="outline" className="ml-auto">Manage Roles</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leagues">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-padeliga-teal" />
                  <span>League Management</span>
                  <Badge variant="outline" className="ml-auto">Manage Leagues</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <LeagueManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-padeliga-purple" />
                  <span>Platform Settings</span>
                  <Badge variant="outline" className="ml-auto">Configure</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-6">
                <p className="text-center py-4 text-muted-foreground">
                  Settings module will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default withRoleAuth(AdminDashboard, [ROLES.ADMIN]);
