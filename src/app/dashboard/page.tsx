"use client";

import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { 
  User, 
  Users, 
  Trophy, 
  Calendar, 
  BarChart, 
  ArrowRight,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  return (
    <div className="min-h-screen transition-colors duration-200">
      <main className="container mx-auto px-3 py-6 sm:px-6 max-w-7xl">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {menuItems.map((item) => (
            <Card key={item.href} className="overflow-hidden border-0 card-highlight">
              <div className="h-full p-6 relative group">
                <div className={`absolute top-0 left-0 w-full h-1 bg-${item.color}`} />
                
                <div className={`inline-flex items-center justify-center p-2 rounded-none bg-${item.color}/10 mb-4`}>
                  <item.icon className={`h-6 w-6 text-${item.color}`} />
                </div>
                
                <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  {item.description}
                </p>
                
                <div className="mt-auto pt-2">
                  <Button 
                    variant="ghost" 
                    asChild 
                    className={`group-hover:text-${item.color} transition-colors p-0 h-auto font-semibold`}
                  >
                    <Link href={item.href} className="flex items-center">
                      <span>Go to {item.title}</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
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
