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
import { AdminActionCard } from "@/components/admin/AdminActionCard";
import { Badge } from "@/components/ui/badge";
import { SkewedStatCard } from "@/components/dashboard/SkewedStatCard";

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
  
  // Admin quick actions
  const quickActions = [
    { 
      title: "Manage Users", 
      description: "Add, edit or remove users", 
      icon: UsersRound, 
      color: "padeliga-teal",
      onClick: () => setActiveTab("users")
    },
    { 
      title: "Create League", 
      description: "Set up a new league", 
      icon: Trophy, 
      color: "padeliga-purple",
      onClick: () => setActiveTab("leagues") 
    },
    { 
      title: "Send Invites", 
      description: "Invite new players", 
      icon: Mail, 
      color: "padeliga-orange",
      onClick: () => setActiveTab("invitations")
    },
    { 
      title: "Manage Roles", 
      description: "Update user permissions", 
      icon: ShieldCheck, 
      color: "padeliga-green",
      onClick: () => setActiveTab("roles")
    },
    { 
      title: "View Reports", 
      description: "Platform analytics", 
      icon: BarChart, 
      color: "padeliga-teal",
      onClick: () => console.log("Reports clicked")
    },
    { 
      title: "Settings", 
      description: "Configure platform", 
      icon: Settings, 
      color: "padeliga-purple",
      onClick: () => setActiveTab("settings")
    }
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
      <main className="container mx-auto px-4 py-4 max-w-7xl relative z-10">
        <h1 className="text-3xl font-bold tracking-tight heading-accent inline-block mb-6">
          Admin Dashboard
        </h1>
        
        {/* Dashboard tabs with improved styling */}
        <Tabs
          defaultValue="dashboard"
          className="space-y-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="bg-card/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-border p-1 sticky top-[56px] z-20">
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
              {/* Platform Stats Cards - using SkewedStatCard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platformStats.map((stat, index) => (
                  <SkewedStatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    color={stat.color}
                    icon={stat.icon}
                  />
                ))}
              </div>
              
              {/* Main Dashboard Content */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Admin Quick Actions - using new AdminActionCard */}
                <Card className="md:col-span-2 bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {quickActions.map((action, index) => (
                      <AdminActionCard
                        key={index}
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        color={action.color}
                        onClick={action.onClick}
                      />
                    ))}
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
              <CardContent className="p-4 pt-6">
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardContent className="p-4 pt-6">
                <PlayerManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
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
              <CardContent className="p-4 pt-6">
                <RoleManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leagues">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
              <CardContent className="p-4 pt-6">
                <LeagueManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
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
