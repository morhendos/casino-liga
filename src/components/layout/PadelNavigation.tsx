"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LucideIcon, User, Users, Trophy, Calendar, BarChart } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function PadelNavigation() {
  const pathname = usePathname();
  
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
      icon: BarChart
    }
  ];
  
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
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
