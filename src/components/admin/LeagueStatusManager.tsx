"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Info, Check, AlertTriangle, Calendar, Flag, Users } from "lucide-react";

// League status types
type LeagueStatus = 'draft' | 'registration' | 'active' | 'completed' | 'canceled';

// Props for the component
interface LeagueStatusManagerProps {
  leagueId: string;
  currentStatus: LeagueStatus;
  teamsCount: number;
  minTeams: number;
  maxTeams: number;
  hasSchedule: boolean;
  onStatusChange?: (newStatus: LeagueStatus) => void;
}

export default function LeagueStatusManager({
  leagueId,
  currentStatus,
  teamsCount,
  minTeams,
  maxTeams,
  hasSchedule,
  onStatusChange,
}: LeagueStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [openDialog, setOpenDialog] = useState<LeagueStatus | null>(null);

  // Handle the status update
  const handleStatusUpdate = async (newStatus: LeagueStatus) => {
    try {
      setIsUpdating(true);
      
      // API call would go here
      const response = await fetch(`/api/leagues/${leagueId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update league status");
      }

      // Success
      toast.success(`League status updated to ${formatStatus(newStatus)}`);
      
      // Call the callback if provided
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error("Error updating league status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update league status"
      );
    } finally {
      setIsUpdating(false);
      setOpenDialog(null);
    }
  };

  // Format status for display
  const formatStatus = (status: LeagueStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get badge variant based on status
  const getStatusBadgeVariant = (status: LeagueStatus) => {
    switch (status) {
      case "draft":
        return "outline";
      case "registration":
        return "secondary";
      case "active":
        return "default";
      case "completed":
        return "success";
      case "canceled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Get next available status options
  const getAvailableStatusTransitions = (): LeagueStatus[] => {
    switch (currentStatus) {
      case "draft":
        return ["registration", "canceled"];
      case "registration":
        return ["active", "canceled", "draft"];
      case "active":
        return ["completed", "canceled"];
      case "completed":
        // No transitions from completed
        return [];
      case "canceled":
        // No transitions from canceled
        return [];
      default:
        return [];
    }
  };

  // Check if a status transition is valid
  const canTransitionTo = (status: LeagueStatus): boolean => {
    if (isUpdating) return false;

    switch (status) {
      case "registration":
        // Can only move to registration if we're in draft
        return currentStatus === "draft";
      case "active":
        // Need minimum teams and a schedule to activate
        return (
          currentStatus === "registration" &&
          teamsCount >= minTeams &&
          hasSchedule
        );
      case "completed":
        // Can only complete from active status
        return currentStatus === "active";
      case "canceled":
        // Can cancel from draft, registration, or active
        return ["draft", "registration", "active"].includes(currentStatus);
      case "draft":
        // Can go back to draft only from registration
        return currentStatus === "registration";
      default:
        return false;
    }
  };

  // Status transition requirements
  const getTransitionRequirements = (status: LeagueStatus): string[] => {
    const requirements: string[] = [];

    switch (status) {
      case "active":
        if (teamsCount < minTeams) {
          requirements.push(`Need at least ${minTeams} teams (currently have ${teamsCount})`);
        }
        if (!hasSchedule) {
          requirements.push("Schedule must be generated first");
        }
        break;
      
      case "completed":
        // Add any completion requirements here
        break;
    }

    return requirements;
  };

  // Status button for triggering transitions
  const StatusButton = ({ status }: { status: LeagueStatus }) => {
    const isValid = canTransitionTo(status);
    const requirements = getTransitionRequirements(status);
    const hasRequirements = requirements.length > 0;

    // Button text based on status
    const buttonText = () => {
      switch (status) {
        case "registration":
          return "Open Registration";
        case "active":
          return "Start League";
        case "completed":
          return "Complete League";
        case "canceled":
          return "Cancel League";
        case "draft":
          return "Move Back to Draft";
        default:
          return `Move to ${formatStatus(status)}`;
      }
    };

    // Button variants based on status
    const buttonVariant = () => {
      switch (status) {
        case "active":
          return "default";
        case "completed":
          return "outline";
        case "canceled":
          return "destructive";
        default:
          return "outline";
      }
    };

    // Icon based on status
    const StatusIcon = () => {
      switch (status) {
        case "registration":
          return <Users className="h-4 w-4 mr-2" />;
        case "active":
          return <Flag className="h-4 w-4 mr-2" />;
        case "completed":
          return <Check className="h-4 w-4 mr-2" />;
        case "canceled":
          return <AlertTriangle className="h-4 w-4 mr-2" />;
        case "draft":
          return <Calendar className="h-4 w-4 mr-2" />;
        default:
          return null;
      }
    };

    return (
      <div className="mb-2">
        <AlertDialog open={openDialog === status} onOpenChange={(open) => !open && setOpenDialog(null)}>
          <AlertDialogTrigger asChild>
            <Button
              variant={buttonVariant()}
              disabled={!isValid || isUpdating}
              className="w-full"
              onClick={() => setOpenDialog(status)}
            >
              <StatusIcon />
              {buttonText()}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {`Update league to ${formatStatus(status)}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {status === "canceled" ? (
                  <span className="text-destructive">
                    Warning: Canceling a league cannot be undone.
                  </span>
                ) : status === "completed" ? (
                  <span>
                    Completing a league will mark it as finished and finalize all rankings.
                  </span>
                ) : (
                  <span>
                    This will change the league status to {formatStatus(status)}.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {hasRequirements && (
          <div className="text-xs text-muted-foreground mt-1">
            <ul className="list-disc list-inside">
              {requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>League Status</span>
          <Badge variant={getStatusBadgeVariant(currentStatus)}>
            {formatStatus(currentStatus)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage the current status of your league
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {currentStatus === "draft" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm flex">
              <Info className="h-4 w-4 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">League in Draft Mode</p>
                <p className="text-yellow-700">
                  Your league is currently in draft mode. Open registration to allow teams to join.
                </p>
              </div>
            </div>
          )}

          {currentStatus === "registration" && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm flex">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
              <div>
                <p className="text-blue-800 font-medium">Registration Open</p>
                <p className="text-blue-700">
                  {teamsCount < minTeams
                    ? `You need at least ${minTeams} teams to start the league. Currently have ${teamsCount}.`
                    : `You have ${teamsCount} of ${maxTeams} possible teams registered.`}
                </p>
              </div>
            </div>
          )}

          {currentStatus === "active" && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm flex">
              <Info className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
              <div>
                <p className="text-green-800 font-medium">League is Active</p>
                <p className="text-green-700">
                  The league is currently in progress. Match results can be recorded.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Available Actions:</p>
            
            {getAvailableStatusTransitions().length > 0 ? (
              getAvailableStatusTransitions().map((status) => (
                <StatusButton key={status} status={status} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No status changes available for {formatStatus(currentStatus)} leagues.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start border-t px-6 py-4">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Changing league status may affect team registration, scheduling, and match recording capabilities.
        </p>
      </CardFooter>
    </Card>
  );
}
