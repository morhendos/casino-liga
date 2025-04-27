"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";

function AdminPage() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen transition-colors duration-200 relative">
      <main className="container mx-auto px-4 py-4 max-w-7xl relative z-10">
        <h1 className="text-3xl font-bold tracking-tight heading-accent inline-block mb-6">
          Admin Settings
        </h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-card/60 backdrop-blur-sm dark:bg-gray-800/40">
            <CardHeader className="pb-2 border-b">
              <CardTitle>Platform Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Admin features are accessible through the main dashboard. This simplified approach 
                provides better user experience and consistent interface for all users.
              </p>
              <p className="mt-4">
                To manage leagues, teams, players, and other platform features, please use the 
                corresponding sections in the main dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default withRoleAuth(AdminPage, [ROLES.ADMIN]);