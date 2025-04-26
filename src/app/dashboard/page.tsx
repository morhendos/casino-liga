"use client";

import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  Users, 
  Trophy, 
  Calendar, 
  Award,
  CheckCircle, 
  Clock, 
  BadgePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardStats } from "@/components/dashboard";
import { GeometricBackground } from "@/components/ui/GeometricBackground";

function DashboardPage() {
  const { data: session } = useSession();
  
  const menuItems = [
    {
      title: "Player Profile",
      description: "Create or update your player profile with your skill level, preferred position, and other details.",
      icon: User,
      href: "/dashboard/player-profile",
      color: "padeliga-purple"
    },
    {
      title: "Teams",
      description: "Create a new team, join an existing team, or manage your current teams.",
      icon: Users,
      href: "/dashboard/teams",
      color: "padeliga-green"
    },
    {
      title: "Leagues",
      description: "Browse available leagues, register your team, and view league standings.",
      icon: Trophy,
      href: "/dashboard/leagues",
      color: "padeliga-teal"
    },
    {
      title: "Matches",
      description: "View upcoming matches, submit match results, and check your match history.",
      icon: Calendar,
      href: "/dashboard/matches",
      color: "padeliga-orange"
    },
    {
      title: "Rankings",
      description: "Check your current ranking in active leagues and view overall player statistics.",
      icon: Award,
      href: "/dashboard/rankings",
      color: "padeliga-red"
    }
  ];
  
  // Mock stats data - in a real app, these would come from an API
  const statsData = [
    {
      title: "Active Leagues",
      value: "4",
      icon: Trophy,
      color: "padeliga-teal"
    },
    {
      title: "Upcoming Matches",
      value: "2",
      icon: Clock,
      color: "padeliga-orange"
    },
    {
      title: "Completed Matches",
      value: "8",
      icon: CheckCircle,
      color: "padeliga-green"
    },
    {
      title: "Current Teams",
      value: "3",
      icon: Users,
      color: "padeliga-purple"
    }
  ];
  
  return (
    <div className="min-h-screen transition-colors duration-200 relative">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight heading-accent inline-block">
            Welcome to Padeliga!
          </h1>
          
          <p className="text-xl mt-6 text-muted-foreground">
            Hello{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
          </p>
          
          <p className="mt-2 text-lg max-w-3xl">
            This is your dashboard where you can create your player profile, join or create teams, 
            participate in leagues, and track your match results and rankings.
          </p>
        </div>
        
        {/* Stats section */}
        <div className="my-8">
          <DashboardStats stats={statsData} />
        </div>
        
        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-padeliga-teal hover:bg-padeliga-teal/90">
              <BadgePlus className="mr-2 h-4 w-4" />
              Register for League
            </Button>
            <Button className="bg-padeliga-purple hover:bg-padeliga-purple/90">
              <Users className="mr-2 h-4 w-4" />
              Create Team
            </Button>
            <Button className="bg-padeliga-orange hover:bg-padeliga-orange/90">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Match
            </Button>
          </div>
        </div>
        
        {/* Menu cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Manage Your Padel Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <DashboardCard 
                key={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
                color={item.color}
              />
            ))}
          </div>
        </div>
        
        {/* Tips section */}
        <div className="mt-10 bg-paper p-6 border-l-4 border-padeliga-orange">
          <h2 className="text-2xl font-bold mb-2">Quick Tips</h2>
          <ul className="ml-6 list-disc space-y-1">
            <li>Start by creating or updating your <Link href="/dashboard/player-profile" className="text-padeliga-teal hover:underline">player profile</Link></li>
            <li>Join a team or create your own in the <Link href="/dashboard/teams" className="text-padeliga-teal hover:underline">teams section</Link></li>
            <li>Browse available leagues and register your team to participate</li>
            <li>Check the schedule for your upcoming matches</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// Export the protected version of the page
export default withAuth(DashboardPage);
