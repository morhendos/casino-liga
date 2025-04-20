"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteLeagueButtonProps {
  leagueId: string;
  leagueName: string;
  onDeleted?: () => void;
}

export function DeleteLeagueButton({ leagueId, leagueName, onDeleted }: DeleteLeagueButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteTeams, setDeleteTeams] = useState(true);
  const [deletePlayers, setDeletePlayers] = useState(true);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cascadeOptions: {
            deleteTeams,
            deletePlayers
          }
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete league');
      }
      
      const result = await response.json();
      
      toast.success(`League "${leagueName}" deleted successfully`);
      
      // Close the dialog
      setOpen(false);
      
      // Call the onDeleted callback if provided
      if (onDeleted) {
        onDeleted();
      } else {
        // Navigate back to leagues list
        router.push('/dashboard/leagues');
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete league');
    } finally {
      setIsDeleting(false);
    }
  };

  // Ensure that if teams are preserved, players are also preserved
  const handleTeamsCheckChange = (checked: boolean) => {
    setDeleteTeams(checked);
    if (!checked) {
      // If teams are not deleted, players can't be deleted either
      setDeletePlayers(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-1" />
          Delete League
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete League</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the league "{leagueName}"? This action cannot be undone and 
            will remove all matches and rankings associated with this league.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="deleteTeams" 
              checked={deleteTeams} 
              onCheckedChange={handleTeamsCheckChange}
            />
            <Label htmlFor="deleteTeams">
              Delete teams associated with this league
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            If unchecked, teams will remain in the system but will no longer be associated with any league
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="deletePlayers" 
              checked={deletePlayers}
              disabled={!deleteTeams} 
              onCheckedChange={(checked) => setDeletePlayers(checked as boolean)}
            />
            <Label htmlFor="deletePlayers" className={!deleteTeams ? "text-muted-foreground" : ""}>
              Delete players from these teams
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            If unchecked, players will remain in the system even when their teams are deleted
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete League"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}