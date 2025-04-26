"use client";

import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  User, 
  Users, 
  Trophy, 
  Calendar, 
  BarChart, 
  Clock, 
  CheckCircle 
} from "lucide-react";

function DashboardPage() {
  const { data: session } = useSession();
  
  // Dashboard sections
  const dashboardCards = [
    {
      title: "Player Profile",
      icon: User,
      href: "/dashboard/player-profile",
      color: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-500"
    },
    {
      title: "Teams",
      icon: Users,
      href: "/dashboard/teams",
      color: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-500"
    },
    {
      title: "Leagues",
      icon: Trophy,
      href: "/dashboard/leagues",
      color: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-500"
    },
    {
      title: "Matches",
      icon: Calendar,
      href: "/dashboard/matches",
      color: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-500"
    },
    {
      title: "Rankings",
      icon: BarChart,
      href: "/dashboard/rankings",
      color: "bg-red-100 dark:bg-red-900/20", 
      iconColor: "text-red-500"
    }
  ];
  
  // Stats
  const stats = [
    { 
      label: "Active Leagues", 
      value: "4", 
      icon: Trophy, 
      color: "text-blue-500" 
    },
    { 
      label: "Upcoming Matches", 
      value: "2", 
      icon: Clock, 
      color: "text-orange-500" 
    },
    { 
      label: "Completed Matches", 
      value: "8", 
      icon: CheckCircle, 
      color: "text-green-500" 
    },
    { 
      label: "My Teams", 
      value: "2", 
      icon: Users, 
      color: "text-purple-500" 
    }
  ];
  
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ''}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your padel leagues, teams, and matches
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-md ${stat.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Access */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {dashboardCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <div className={`h-full rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md ${card.color}`}>
                  <div className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className={`p-3 rounded-md bg-white dark:bg-gray-800 shadow-sm mb-4`}>
                      <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-medium">{card.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-4 flex items-center">
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Match results submitted</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team Eagles vs Team Falcons - 6-4, 7-5</p>
                </div>
                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  2 days ago
                </div>
              </div>
              
              <div className="py-4 flex items-center">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                  <Trophy className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Joined Summer League</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Team registration confirmed</p>
                </div>
                <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  Last week
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-md">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300">Getting Started</h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            Create your player profile, form a team, and join a league to start playing.
          </p>
        </div>
      </div>
    </div>
  );
}

// Export the protected version of the page
export default withAuth(DashboardPage);
