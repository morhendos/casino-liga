"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { UserCircle, UsersRound, Trophy, UserCog, Mail, ShieldCheck, Settings, BarChart } from "lucide-react";
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import {
  AdminCard,
  AdminDashboardOverview,
  UserManagement,
  PlayerManagement,
  PlayerInvitationManagement,
  RoleManagement,
  LeagueManagement
} from "@/components/admin";

function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [players, setPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

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

  const getTabIcon = (tabId, active = false) => {
    const icons = {
      dashboard: BarChart,
      users: UsersRound,
      players: UserCog,
      invitations: Mail,
      roles: ShieldCheck,
      leagues: Trophy,
      settings: Settings,
    };
    
    const colors = {
      dashboard: "padeliga-teal",
      users: "padeliga-purple",
      players: "padeliga-green",
      invitations: "padeliga-orange",
      roles: "padeliga-red",
      leagues: "padeliga-teal",
      settings: "padeliga-purple",
    };
    
    const Icon = icons[tabId] || BarChart;
    const color = colors[tabId] || "padeliga-teal";
    
    return <Icon className={`h-4 w-4 mr-2 ${active ? `text-${color}` : ''}`} />;
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

        {/* Dashboard tabs */}
        <Tabs
          defaultValue="dashboard"
          className="space-y-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <div className="bg-paper border-b border-border p-1 sticky top-0 z-20">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
              <TabsTrigger value="dashboard" className="px-4 py-2">
                {getTabIcon('dashboard', activeTab === 'dashboard')}
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="px-4 py-2">
                {getTabIcon('users', activeTab === 'users')}
                Users
              </TabsTrigger>
              <TabsTrigger value="players" className="px-4 py-2">
                {getTabIcon('players', activeTab === 'players')}
                Players
              </TabsTrigger>
              <TabsTrigger value="invitations" className="px-4 py-2">
                {getTabIcon('invitations', activeTab === 'invitations')}
                Invitations
              </TabsTrigger>
              <TabsTrigger value="roles" className="px-4 py-2">
                {getTabIcon('roles', activeTab === 'roles')}
                Roles
              </TabsTrigger>
              <TabsTrigger value="leagues" className="px-4 py-2">
                {getTabIcon('leagues', activeTab === 'leagues')}
                Leagues
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboardOverview onTabChange={setActiveTab} />
          </TabsContent>

          <TabsContent value="users">
            <AdminCard
              title="User Management"
              description="View and manage all users in the system"
              icon={UsersRound}
              color="padeliga-purple"
            >
              <UserManagement />
            </AdminCard>
          </TabsContent>
          
          <TabsContent value="players">
            <AdminCard
              title="Player Management"
              description="Create and manage player profiles"
              icon={UserCog}
              color="padeliga-green"
            >
              <PlayerManagement />
            </AdminCard>
          </TabsContent>

          <TabsContent value="invitations">
            <AdminCard
              title="Player Invitations"
              description="Invite players to join the platform"
              icon={Mail}
              color="padeliga-orange"
            >
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
            </AdminCard>
          </TabsContent>

          <TabsContent value="roles">
            <AdminCard
              title="Role Management"
              description="Assign and manage user roles and permissions"
              icon={ShieldCheck}
              color="padeliga-red"
            >
              <RoleManagement />
            </AdminCard>
          </TabsContent>

          <TabsContent value="leagues">
            <AdminCard
              title="League Management"
              description="Manage leagues, tournaments, and team assignments"
              icon={Trophy}
              color="padeliga-teal"
            >
              <LeagueManagement />
            </AdminCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default withRoleAuth(AdminDashboard, [ROLES.ADMIN]);
