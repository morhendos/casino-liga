"use client";

import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ArrowRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardPage() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight heading-accent inline-block mb-1">
            Dashboard
          </h1>
        </div>
        
        <div className="grid md:grid-cols-12 gap-6">
          {/* Main features column */}
          <div className="md:col-span-7">
            <Card className="mb-6 overflow-hidden">
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Welcome to Padeliga</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  This is your dashboard for managing padel leagues, teams and matches. 
                  Use the navigation to access different sections of the application.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="gap-1">
                    <Link href="/dashboard/leagues">
                      View Leagues
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-1">
                    <Link href="/dashboard/teams">
                      Manage Teams
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">My Teams</span>
                    <Button size="sm" variant="ghost" asChild className="gap-1 text-xs">
                      <Link href="/dashboard/teams">
                        <span>All Teams</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">No teams yet. Create or join a team to get started.</p>
                      <Button asChild variant="outline" size="sm" className="flex items-center justify-center gap-1">
                        <Link href="/dashboard/teams/create">
                          <Plus className="h-4 w-4" />
                          <span>Create New Team</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Side column */}
          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Upcoming Matches</span>
                  <Button size="sm" variant="ghost" asChild className="gap-1 text-xs">
                    <Link href="/dashboard/matches">
                      <span>Calendar</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No upcoming matches scheduled.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                <CardTitle className="text-xl">Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Add your playing experience, preferred position, and skill level to find better matches.
                  </p>
                  
                  <Button size="sm" asChild className="mt-1">
                    <Link href="/dashboard/player-profile">
                      Complete Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
