"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LucideIcon, Home, User, Users, Trophy, Calendar, BarChart, Medal, Settings } from "lucide-react";
import { isAdmin, isPlayer } from "@/lib/auth/role-utils";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  playerOnly?: boolean;
}

export function PadelNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/dashboard",
      icon: Home
    },
    {
      label: "Profile",
      href: "/dashboard/player-profile",
      icon: User
    },
    {
      label: "Teams",
      href: "/dashboard/teams",
      icon: Users
    },
    {
      label: "Leagues",
      href: "/dashboard/leagues",
      icon: Trophy
    },
    {
      label: "Matches",
      href: "/dashboard/matches",
      icon: Calendar
    },
    {
      label: "Rankings",
      href: "/dashboard/rankings",
      icon: BarChart,
      adminOnly: true
    },
    {
      label: "My Rankings",
      href: "/dashboard/my-rankings",
      icon: Medal,
      playerOnly: true
    },
    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: Settings,
      adminOnly: true
    }
  ];
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin(session);
    }
    
    if (item.playerOnly) {
      return isPlayer(session);
    }
    
    return true;
  });
  
  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const isActive = 
          pathname === item.href || 
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center group px-3 py-2 text-sm rounded-md transition-colors",
              isActive
                ? "bg-padeliga-teal/10 text-padeliga-teal font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <item.icon 
              className={cn(
                "flex-shrink-0 -ml-0.5 mr-3 h-5 w-5",
                isActive
                  ? "text-padeliga-teal"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
              )} 
            />
            {item.label}
            
            {isActive && (
              <div className="ml-auto w-1 h-5 bg-padeliga-teal rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
