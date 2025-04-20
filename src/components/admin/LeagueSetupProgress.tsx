"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon, CheckCircle, CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface LeagueSetupProgressProps {
  leagueId: string;
  leagueName: string;
  currentStatus: string;
  teamsCount: number;
  minTeams: number;
  hasSchedule: boolean;
  isComplete: boolean;
}

export default function LeagueSetupProgress({ 
  leagueId,
  leagueName, 
  currentStatus, 
  teamsCount, 
  minTeams,
  hasSchedule,
  isComplete
}: LeagueSetupProgressProps) {
  const [gamesCount, setGamesCount] = useState(0);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  
  // Fetch games count for the league
  useEffect(() => {
    const fetchGamesCount = async () => {
      try {
        setIsLoadingGames(true);
        const response = await fetch(`/api/leagues/${leagueId}/schedule`);
        
        if (response.ok) {
          const games = await response.json();
          setGamesCount(Array.isArray(games) ? games.length : 0);
        } else {
          setGamesCount(0);
        }
      } catch (error) {
        console.error("Error fetching games count:", error);
        setGamesCount(0);
      } finally {
        setIsLoadingGames(false);
      }
    };
    
    fetchGamesCount();
  }, [leagueId]);
  
  // Calculate setup progress
  const steps = [
    {
      name: "Create League",
      isComplete: true, // Always complete since we're on the league page
      url: `/dashboard/leagues/${leagueId}/edit`,
      icon: CheckCircle
    },
    {
      name: "Add Teams",
      isComplete: teamsCount >= minTeams,
      url: `/dashboard/leagues/${leagueId}/manage?tab=teams`,
      icon: teamsCount >= minTeams ? CheckCircle : CircleAlert
    },
    {
      name: "Create Games",
      isComplete: gamesCount > 0,
      url: `/dashboard/leagues/${leagueId}/schedule?tab=games`,
      icon: gamesCount > 0 ? CheckCircle : CircleAlert
    },
    {
      name: "Generate Schedule",
      isComplete: hasSchedule,
      url: `/dashboard/leagues/${leagueId}/schedule?tab=generate`,
      icon: hasSchedule ? CheckCircle : CircleAlert,
      isOptional: true
    },
    {
      name: "Activate League",
      isComplete: currentStatus === "active" || currentStatus === "completed",
      url: `/dashboard/leagues/${leagueId}/manage`,
      icon: (currentStatus === "active" || currentStatus === "completed") ? CheckCircle : CircleAlert
    }
  ];
  
  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.isComplete).length;
  const totalRequiredSteps = steps.filter(step => !step.isOptional).length;
  const progressPercentage = Math.round((completedSteps / totalRequiredSteps) * 100);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">League Setup Progress</CardTitle>
        <CardDescription>
          Complete these steps to set up {leagueName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {isComplete ? "Setup Complete" : `${progressPercentage}% Complete`}
            </span>
            <span className="text-sm text-muted-foreground">
              {completedSteps} of {totalRequiredSteps} steps
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`mr-3 h-6 w-6 rounded-full flex items-center justify-center ${
                  step.isComplete ? "text-green-500" : "text-amber-500"
                }`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">
                  {step.name}
                  {step.isOptional && (
                    <span className="ml-2 text-xs text-muted-foreground">(Optional)</span>
                  )}
                </span>
              </div>
              {!step.isComplete && !isComplete && (
                <Link 
                  href={step.url}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Complete
                </Link>
              )}
            </div>
          ))}
        </div>
        
        {isComplete && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded border border-green-100">
            <div className="flex items-center text-sm font-medium">
              <CheckCircle className="h-4 w-4 mr-2" />
              Setup completed successfully!
            </div>
          </div>
        )}
        
        {!isComplete && currentStatus !== "draft" && currentStatus !== "registration" && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-700 rounded border border-amber-100">
            <div className="flex items-center text-sm">
              <InfoIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Complete all required steps to fully set up your league.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
