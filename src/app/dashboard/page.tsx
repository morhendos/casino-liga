"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function DashboardPage() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen transition-colors duration-200">
      <main className="container mx-auto px-3 py-4 sm:px-4 max-w-7xl">
        <PageHeader />
        
        <div className="mt-8">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to Padeliga!</h1>
            
            <div className="space-y-4">
              <p className="text-lg">
                Hello{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
              </p>
              
              <p>
                Welcome to Padeliga! This is your dashboard where you can 
                create your player profile, join or create teams, participate in leagues,
                and track your match results and rankings.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Link href="/dashboard/player-profile" className="group">
                  <div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 h-full">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary">Player Profile</h2>
                    <p className="text-sm text-muted-foreground">
                      Create or update your player profile with your skill level, preferred position, and other details.
                    </p>
                  </div>
                </Link>
                
                <Link href="/dashboard/teams" className="group">
                  <div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 h-full">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary">Teams</h2>
                    <p className="text-sm text-muted-foreground">
                      Create a new team, join an existing team, or manage your current teams.
                    </p>
                  </div>
                </Link>
                
                <Link href="/dashboard/leagues" className="group">
                  <div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 h-full">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary">Leagues</h2>
                    <p className="text-sm text-muted-foreground">
                      Browse available leagues, register your team, and view league standings.
                    </p>
                  </div>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Link href="/dashboard/matches" className="group">
                  <div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 h-full">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary">Matches</h2>
                    <p className="text-sm text-muted-foreground">
                      View upcoming matches, submit match results, and check your match history.
                    </p>
                  </div>
                </Link>
                
                <Link href="/dashboard/rankings" className="group">
                  <div className="border rounded-lg p-4 transition-colors hover:bg-muted/50 h-full">
                    <h2 className="font-semibold text-lg mb-2 group-hover:text-primary">Rankings</h2>
                    <p className="text-sm text-muted-foreground">
                      Check your current ranking in active leagues and view overall player statistics.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Export the protected version of the page
export default withAuth(DashboardPage);
