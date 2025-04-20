"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pencil, 
  Save, 
  X, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  CheckCircle2, 
  AlertCircle,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  _id: string;
  teamA: {
    id: string;
    name: string;
  };
  teamB: {
    id: string;
    name: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  location?: string;
  status: string;
  result?: {
    teamAScore: number[];
    teamBScore: number[];
    winner: string;
  };
}

interface ScheduleManagementTableProps {
  matches: Match[];
  leagueId: string;
  isAdmin: boolean;
  onMatchUpdated: () => void;
  onScheduleCleared: () => void;
}

export default function ScheduleManagementTable({
  matches,
  leagueId,
  isAdmin,
  onMatchUpdated,
  onScheduleCleared
}: ScheduleManagementTableProps) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    scheduledDate: string;
    scheduledTime: string;
    location: string;
    status: string;
  }>({
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    status: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Starting to edit a match
  const handleEditMatch = (match: Match) => {
    setEditingMatch(match.id || match._id);
    setEditData({
      scheduledDate: match.scheduledDate ? new Date(match.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: match.scheduledTime || '',
      location: match.location || '',
      status: match.status
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMatch(null);
  };

  // Save match changes
  const handleSaveMatch = async (matchId: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledDate: editData.scheduledDate,
          scheduledTime: editData.scheduledTime,
          location: editData.location,
          status: editData.status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update match');
      }
      
      toast.success('Match updated successfully');
      setEditingMatch(null);
      onMatchUpdated();
    } catch (error) {
      console.error('Error updating match:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update match');
    } finally {
      setIsSaving(false);
    }
  };

  // Clear schedule
  const handleClearSchedule = async () => {
    try {
      setIsClearing(true);
      
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear schedule');
      }
      
      toast.success('Schedule cleared successfully');
      setShowClearDialog(false);
      onScheduleCleared();
    } catch (error) {
      console.error('Error clearing schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clear schedule');
    } finally {
      setIsClearing(false);
    }
  };

  // Group matches by date for better display
  const matchesByDate: Record<string, Match[]> = {};
  
  // Sort matches by date
  const sortedMatches = [...matches].sort((a, b) => {
    return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
  });
  
  // Group into matchesByDate
  sortedMatches.forEach(match => {
    const date = new Date(match.scheduledDate).toLocaleDateString();
    if (!matchesByDate[date]) {
      matchesByDate[date] = [];
    }
    matchesByDate[date].push(match);
  });
  
  // Get dates in order
  const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-700">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'postponed':
        return <Badge variant="secondary">Postponed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // If there are no matches, show a message
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Matches Scheduled</h3>
        <p className="text-muted-foreground mb-2">
          There are currently no matches scheduled for this league.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Schedule
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Schedule</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all schedule information (dates, times and locations) from matches in this league, but will keep the matches themselves. The games will remain available for scheduling. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearSchedule}
                  disabled={isClearing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isClearing ? 'Clearing...' : 'Clear Schedule'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {sortedDates.map(date => (
        <div key={date} className="border rounded-md overflow-hidden mb-6">
          <div className="bg-muted px-4 py-3 font-medium">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {new Date(date).toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Team A</TableHead>
                <TableHead>Team B</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchesByDate[date].map(match => (
                <TableRow key={match.id || match._id} className={cn(
                  match.status === 'canceled' && "bg-muted/50 text-muted-foreground",
                  editingMatch === (match.id || match._id) && "bg-blue-50"
                )}>
                  <TableCell>
                    {editingMatch === (match.id || match._id) ? (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                          type="time"
                          value={editData.scheduledTime}
                          onChange={(e) => setEditData({ ...editData, scheduledTime: e.target.value })}
                          className="max-w-[120px]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {match.scheduledTime || 'TBD'}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>{match.teamA.name}</TableCell>
                  
                  <TableCell>{match.teamB.name}</TableCell>
                  
                  <TableCell>
                    {editingMatch === (match.id || match._id) ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                          type="text"
                          value={editData.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          placeholder="Location"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        {match.location || 'TBD'}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    {editingMatch === (match.id || match._id) ? (
                      <Select
                        value={editData.status}
                        onValueChange={(value) => setEditData({ ...editData, status: value })}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="postponed">Postponed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(match.status)
                    )}
                  </TableCell>

                  {isAdmin && (
                    <TableCell className="text-right">
                      {editingMatch === (match.id || match._id) ? (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveMatch(match.id || match._id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <>Saving...</>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditMatch(match)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}