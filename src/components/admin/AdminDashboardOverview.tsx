"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Users, Calendar, UserCog, UsersRound, Mail, ShieldCheck } from "lucide-react";
import { DashboardStats } from "@/components/dashboard";
import { AdminCard, AdminActionCard, AdminStatCard } from "@/components/admin";

interface AdminDashboardOverviewProps {
  onTabChange: (tab: string) => void;
}

export function AdminDashboardOverview({ onTabChange }: AdminDashboardOverviewProps) {
  // Stats data (could be fetched from an API in a real application)
  const statsData = [
    {
      title: "Total Users",
      value: "42",
      icon: Users,
      color: "padeliga-purple",
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: "Active Leagues",
      value: "7",
      icon: Trophy,
      color: "padeliga-teal"
    },
    {
      title: "Scheduled Matches",
      value: "28",
      icon: Calendar,
      color: "padeliga-orange"
    },
    {
      title: "Total Players",
      value: "124",
      icon: UserCog,
      color: "padeliga-green"
    }
  ];

  // Activity data (could come from an API)
  const activityData = [
    {
      icon: UserCog,
      color: "padeliga-green",
      title: "New player registered",
      description: "Juan Martínez created a player profile",
      time: "2 hours ago"
    },
    {
      icon: Trophy,
      color: "padeliga-teal",
      title: "League status updated",
      description: "Summer League status changed to Active",
      time: "5 hours ago"
    },
    {
      icon: Calendar,
      color: "padeliga-orange",
      title: "Match results submitted",
      description: "Team Aces vs Team Eagles - 6-4, 6-3",
      time: "Yesterday"
    }
  ];

  // Quick access cards
  const quickAccessItems = [
    {
      title: "Manage Users",
      description: "Add, edit, or remove platform users and their permissions",
      icon: UsersRound,
      color: "padeliga-purple",
      actionLabel: "User Management",
      tabId: "users"
    },
    {
      title: "League Management",
      description: "Create, configure and monitor leagues and tournaments",
      icon: Trophy,
      color: "padeliga-teal",
      actionLabel: "Manage Leagues",
      tabId: "leagues"
    },
    {
      title: "Player Management",
      description: "Manage player profiles, send invitations, and assign teams",
      icon: UserCog,
      color: "padeliga-green",
      actionLabel: "Manage Players",
      tabId: "players"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Platform Stats */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <AdminStatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccessItems.map((item, index) => (
            <AdminActionCard
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              color={item.color}
              actionLabel={item.actionLabel}
              onClick={() => onTabChange(item.tabId)}
            />
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <AdminCard
          title="Recent Activity"
          description="Latest actions and events on the platform"
          icon={Calendar}
          color="padeliga-orange"
          contentClassName="divide-y"
        >
          {activityData.map((activity, index) => (
            <div key={index} className="py-4 flex items-center">
              <div className={`p-2 bg-${activity.color}/10 mr-4`}>
                <activity.icon className={`h-5 w-5 text-${activity.color}`} />
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">
                {activity.time}
              </div>
            </div>
          ))}
        </AdminCard>
      </section>

      {/* Other Admin Tools */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Additional Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminActionCard
            title="Invite Players"
            description="Send email invitations to new players to join the platform"
            icon={Mail}
            color="padeliga-orange"
            actionLabel="Player Invitations"
            onClick={() => onTabChange("invitations")}
          />
          
          <AdminActionCard
            title="Manage Roles"
            description="Assign and manage role-based permissions for platform users"
            icon={ShieldCheck}
            color="padeliga-red"
            actionLabel="Role Management"
            onClick={() => onTabChange("roles")}
          />
          
          <Card className="border border-dashed border-muted-foreground/20 bg-transparent">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full text-center">
              <p className="text-sm text-muted-foreground">
                More admin features coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardOverview;