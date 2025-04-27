"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LucideIcon, User, Users, Trophy, Calendar, BarChart, Award, Settings, Medal, Home } from "lucide-react";
import { isAdmin, isPlayer } from "@/lib/auth/role-utils";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  playerOnly?: boolean;
  color?: string;
}

interface PadelNavigationProps {
  onSelect?: () => void;
}

export function PadelNavigation({ onSelect }: PadelNavigationProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
      color: "padeliga-teal"
    },
    {
      label: "Player Profile",
      href: "/dashboard/player-profile",
      icon: User,
      color: "padeliga-purple"
    },
    {
      label: "Teams",
      href: "/dashboard/teams",
      icon: Users,
      color: "padeliga-green"
    },
    {
      label: "Leagues",
      href: "/dashboard/leagues",
      icon: Trophy,
      color: "padeliga-orange"
    },
    {
      label: "Matches",
      href: "/dashboard/matches",
      icon: Calendar,
      color: "padeliga-teal"
    },
    {
      label: "Rankings",
      href: "/dashboard/rankings",
      icon: BarChart,
      adminOnly: true, // Global rankings for admins
      color: "padeliga-red"
    },
    {
      label: "My Rankings",
      href: "/dashboard/my-rankings",
      icon: Medal,
      playerOnly: true, // Personal rankings for players
      color: "padeliga-orange"
    },
    {
      label: "Admin",
      href: "/dashboard/admin",
      icon: Settings,
      adminOnly: true, // Only show for admin users
      color: "padeliga-purple"
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
  
  // Handle link click
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };
  
  return (
    <nav className="space-y-2">
      {filteredNavItems.map((item) => {
        const isActive = 
          pathname === item.href || 
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
        
        const colorClass = item.color || "padeliga-teal";
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleClick}
            className={cn(
              "flex h-10 items-center text-sm font-medium transition-colors relative group",
              isActive 
                ? `text-${colorClass} bg-${colorClass}/10` 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${colorClass}`} />
            )}
            
            <div className="flex items-center px-4 py-2">
              <item.icon className={cn(
                "mr-3 h-5 w-5",
                isActive 
                  ? `text-${colorClass}` 
                  : "text-muted-foreground group-hover:text-foreground"
              )} />
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
