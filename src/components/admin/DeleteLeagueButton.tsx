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

interface DeleteLeagueButtonProps {
  leagueId: string;
  leagueName: string;
  onDeleted?: () => void;
}

export function DeleteLeagueButton({ leagueId, leagueName, onDeleted }: DeleteLeagueButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete league');
      }
      
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
            will remove all teams, matches, and rankings associated with this league.
          </AlertDialogDescription>
        </AlertDialogHeader>
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