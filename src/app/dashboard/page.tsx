"use client";

import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  Trophy, 
  CalendarDays, 
  Users, 
  CheckCircle, 
  Clock,
  Plus,
  ArrowRight,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeometricBackground } from "@/components/ui/GeometricBackground";
import { Badge } from "@/components/ui/badge";
import { SkewedStatCard } from "@/components/dashboard/SkewedStatCard";
import { SkewedActionButton } from "@/components/dashboard/SkewedActionButton";

function DashboardPage() {
  const { data: session } = useSession();
  
  // Mock stats data - in a real app, these would come from an API
  const statsData = [
    {
      title: "Active Leagues",
      value: "4",
      color: "padeliga-teal",
      icon: Trophy
    },
    {
      title: "Upcoming Matches",
      value: "2",
      color: "padeliga-orange",
      icon: Clock
    },
    {
      title: "Completed Matches",
      value: "8",
      color: "padeliga-green",
      icon: CheckCircle
    },
    {
      title: "Teams",
      value: "3",
      color: "padeliga-purple",
      icon: Users
    }
  ];

  // Quick actions
  const quickActions = [
    {
      label: "Join League",
      href: "/dashboard/leagues",
      icon: Trophy,
      color: "padeliga-teal"
    },
    {
      label: "Create Team",
      href: "/dashboard/teams/new",
      icon: Users,
      color: "padeliga-purple"
    },
    {
      label: "Schedule Match",
      href: "/dashboard/matches/schedule",
      icon: CalendarDays,
      color: "padeliga-orange"
    },
    {
      label: "View Stats",
      href: "/dashboard/stats",
      icon: BarChart,
      color: "padeliga-green"
    }
  ];
  
  // Recent activity items
  const recentActivity = [
    {
      type: "match",
      title: "Match Result Recorded",
      description: "Win against Team Eagles (6-3, 7-5)",
      date: "Today",
      color: "padeliga-green"
    },
    {
      type: "league",
      title: "New League Started",
      description: "Summer Championship 2025",
      date: "Yesterday",
      color: "padeliga-teal"
    },
    {
      type: "match",
      title: "Upcoming Match",
      description: "vs Team Titans - Monday, 16:00",
      date: "In 2 days",
      color: "padeliga-orange"
    }
  ];
  
  return (
    <div className="min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight heading-accent inline-block mb-1">
            Dashboard
          </h1>
        </div>
        
        {/* Stats cards with skewed design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <SkewedStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
            />
          ))}
        </div>
        
        <div className="grid md:grid-cols-12 gap-6">
          {/* Main features column */}
          <div className="md:col-span-7">
            <Card className="mb-6 overflow-hidden">
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <SkewedActionButton
                    key={index}
                    label={action.label}
                    icon={action.icon}
                    color={action.color}
                    href={action.href}
                  />
                ))}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-padeliga-purple/10 mr-3">
                          <Users className="h-5 w-5 text-padeliga-purple" />
                        </div>
                        <div>
                          <h3 className="font-medium">Padel Masters</h3>
                          <p className="text-sm text-muted-foreground">With Carlos Sanchez</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-padeliga-teal border-padeliga-teal">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between border-b pb-3 pt-1">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-padeliga-teal/10 mr-3">
                          <Users className="h-5 w-5 text-padeliga-teal" />
                        </div>
                        <div>
                          <h3 className="font-medium">Smash Brothers</h3>
                          <p className="text-sm text-muted-foreground">With Miguel Fernandez</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-padeliga-orange border-padeliga-orange">Stand-by</Badge>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full mt-2 flex items-center justify-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Create New Team</span>
                    </Button>
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
                  <span className="text-xl">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 flex">
                      <div className={`w-2 self-stretch mr-4 bg-${activity.color} rounded-sm`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium">{activity.title}</h3>
                          <span className="text-xs text-muted-foreground">{activity.date}</span>
                        </div>
                        <p className="text-sm">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
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
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 text-center mr-4">
                      <span className="text-xl font-bold block">28</span>
                      <span className="text-xs text-muted-foreground block">APR</span>
                    </div>
                    <div className="flex-1 border-l pl-4">
                      <p className="font-medium">vs Team Titans</p>
                      <p className="text-sm text-muted-foreground">16:00 - Club Padel Center</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 text-center mr-4">
                      <span className="text-xl font-bold block">03</span>
                      <span className="text-xs text-muted-foreground block">MAY</span>
                    </div>
                    <div className="flex-1 border-l pl-4">
                      <p className="font-medium">vs Padel Stars</p>
                      <p className="text-sm text-muted-foreground">18:30 - Urban Padel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-card/60 dark:bg-card/30 backdrop-blur-sm pb-2 border-b">
                <CardTitle className="text-xl">Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-padeliga-purple" />
                      <span>Player Profile</span>
                    </div>
                    <Badge variant="outline" className="text-padeliga-red border-padeliga-red">Incomplete</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Add your playing experience, preferred position, and skill level to find better matches.
                  </p>
                  
                  <Button size="sm" asChild className="mt-1 bg-padeliga-purple hover:bg-padeliga-purple/90">
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