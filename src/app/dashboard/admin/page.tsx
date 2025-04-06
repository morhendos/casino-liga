"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { UserCircle, UsersRound, Trophy, UserCog } from "lucide-react";
import { UserManagement } from "@/components/admin/UserManagement";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { LeagueManagement } from "@/components/admin/LeagueManagement";
import { PlayerManagement } from "@/components/admin/PlayerManagement";

function AdminDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, players, roles, and system settings
        </p>
      </div>

      <Tabs
        defaultValue="users"
        className="space-y-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="users">
            <UsersRound className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="players">
            <UserCog className="h-4 w-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="roles">
            <UserCircle className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="leagues">
            <Trophy className="h-4 w-4 mr-2" />
            Leagues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>Player Management</CardTitle>
              <CardDescription>
                Create and manage player profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Assign and manage user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leagues">
          <Card>
            <CardHeader>
              <CardTitle>League Management</CardTitle>
              <CardDescription>
                Manage leagues and team assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeagueManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withRoleAuth(AdminDashboard, [ROLES.ADMIN]);
