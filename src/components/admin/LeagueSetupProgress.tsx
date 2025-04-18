"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, CheckCircle2, Circle, Calendar, Users, Trophy, Clock } from "lucide-react";

interface LeagueSetupProgressProps {
  leagueId: string;
  leagueName: string;
  currentStatus: string;
  teamsCount: number;
  minTeams: number;
  hasSchedule: boolean;
  isComplete?: boolean;
}

type SetupStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
};

export default function LeagueSetupProgress({
  leagueId,
  leagueName,
  currentStatus,
  teamsCount,
  minTeams,
  hasSchedule,
  isComplete = false,
}: LeagueSetupProgressProps) {
  // Determine which steps are completed
  const leagueCreated = true; // Always true if we're viewing this component
  const teamsAdded = teamsCount >= minTeams;
  const scheduleGenerated = hasSchedule;
  const leagueStarted = currentStatus === "active";
  
  // Define the setup steps
  const setupSteps: SetupStep[] = [
    {
      id: "create",
      title: "Create League",
      description: `League "${leagueName}" has been created`,
      completed: leagueCreated,
      icon: <Clipboard className="h-5 w-5" />,
      action: {
        label: "Edit League",
        href: `/dashboard/leagues/${leagueId}/edit`,
      },
    },
    {
      id: "teams",
      title: "Add Teams",
      description: teamsCount > 0 
        ? `${teamsCount} of ${minTeams} required teams added${teamsAdded ? " ✓" : ""}`
        : "No teams added yet",
      completed: teamsAdded,
      icon: <Users className="h-5 w-5" />,
      action: {
        label: teamsCount === 0 ? "Add Teams" : "Manage Teams",
        href: `/dashboard/leagues/${leagueId}/teams`,
      },
    },
    {
      id: "schedule",
      title: "Generate Schedule",
      description: scheduleGenerated
        ? "Schedule has been generated"
        : "Schedule needs to be generated",
      completed: scheduleGenerated,
      icon: <Calendar className="h-5 w-5" />,
      action: {
        label: scheduleGenerated ? "View Schedule" : "Generate Schedule",
        href: `/dashboard/leagues/${leagueId}/schedule`,
      },
    },
    {
      id: "start",
      title: "Start League",
      description: leagueStarted
        ? "League is active"
        : "League needs to be activated",
      completed: leagueStarted,
      icon: <Trophy className="h-5 w-5" />,
      // No action for this step - it's handled by the LeagueStatusManager
    },
  ];

  // Calculate completion percentage
  const completedSteps = setupSteps.filter((step) => step.completed).length;
  const totalSteps = setupSteps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>League Setup Progress</span>
          <span className="text-lg font-normal">{completionPercentage}% Complete</span>
        </CardTitle>
        <CardDescription>
          Follow these steps to complete your league setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress bar - Updated with better contrast */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {/* Setup steps */}
          <ol className="relative border-l border-gray-200">
            {setupSteps.map((step, index) => (
              <li key={step.id} className="mb-8 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-white">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className={`w-5 h-5 ${index === completedSteps ? "text-amber-400" : "text-gray-300"}`} />
                  )}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {step.icon && <span className="mr-2">{step.icon}</span>}
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                  </div>
                  {step.action && (
                    <Button
                      variant={step.completed ? "outline" : "default"}
                      size="sm"
                      asChild
                      className="sm:ml-4 self-start"
                    >
                      <Link href={step.action.href}>
                        {step.action.label}
                      </Link>
                    </Button>
                  )}
                </div>
                {!step.completed && index === completedSteps && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800 flex items-start">
                    <Clock className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {index === 1
                        ? `Add at least ${minTeams} teams to continue`
                        : index === 2
                        ? "Generate a schedule after adding enough teams"
                        : index === 3
                        ? "Use the League Status Manager to activate your league"
                        : "Complete this step to continue"}
                    </span>
                  </div>
                )}
              </li>
            ))}

            {isComplete && (
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </span>
                <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                  <h3 className="font-medium text-green-800">League Setup Complete!</h3>
                  <p className="text-sm text-green-700">
                    Your league is ready. You can now manage matches and track results.
                  </p>
                </div>
              </li>
            )}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}