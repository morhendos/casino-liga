"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LucideIcon, User, Users, Trophy, Calendar, BarChart, Award } from "lucide-react";
import { isAdmin, isPlayer } from "@/lib/auth/role-utils";

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
      label: "Player Profile",
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
      icon: Trophy,
      adminOnly: true // Only show for admin users
    },
    {
      label: "My Leagues",
      href: "/dashboard/my-leagues",
      icon: Award,
      playerOnly: true // Only show for player users
    },
    {
      label: "Matches",
      href: "/dashboard/matches",
      icon: Calendar
    },
    {
      label: "Rankings",
      href: "/dashboard/rankings",
      icon: BarChart
    }
  ];
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    // If an item is marked as adminOnly, check if the user is an admin
    if (item.adminOnly) {
      return isAdmin(session);
    }
    
    // If an item is marked as playerOnly, check if the user is a player (not admin-only)
    if (item.playerOnly) {
      return isPlayer(session);
    }
    
    // Otherwise show the item to all authenticated users
    return true;
  });
  
  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${
              isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
            }`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
