"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Match {
  id: string;
  _id?: string;
  teamA: {
    id: string;
    name: string;
  };
  teamB: {
    id: string;
    name: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  status: string;
}

interface GameScheduleFormProps {
  match: Match;
  onScheduled: () => void;
  onCancel?: () => void;
}

export default function GameScheduleForm({
  match,
  onScheduled,
  onCancel
}: GameScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse existing date or default to today
  const dateFromMatch = match.scheduledDate ? new Date(match.scheduledDate) : null;
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    dateFromMatch || new Date()
  );
  
  // Store the original date for debugging
  const [originalDate, setOriginalDate] = useState<string | undefined>(match.scheduledDate);
  
  const [scheduledTime, setScheduledTime] = useState<string>(match.scheduledTime || "");
  const [location, setLocation] = useState<string>(match.location || "");

  // For debugging in dev console
  useEffect(() => {
    console.log("Match in GameScheduleForm:", match);
    console.log("Original date from match:", originalDate);
    console.log("Parsed date from match:", dateFromMatch);
    console.log("Initial scheduledDate state:", scheduledDate);
  }, []);

  const handleSubmit = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }
    
    console.log("Submitting with date:", scheduledDate);

    try {
      setIsSubmitting(true);
      
      // Call the API to schedule the match
      const response = await fetch(`/api/matches/${match.id || match._id}/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduledDate: scheduledDate.toISOString(),
          scheduledTime,
          location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule game");
      }

      toast.success("Game scheduled successfully!");
      onScheduled();
    } catch (error) {
      console.error("Error scheduling game:", error);
      toast.error(error instanceof Error ? error.message : "Failed to schedule game");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Game Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={"w-full pl-3 text-left font-normal"}
                  disabled={isSubmitting}
                >
                  {scheduledDate ? (
                    format(scheduledDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Game Time</Label>
            <Input 
              id="time"
              type="time" 
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={isSubmitting} 
              placeholder="e.g., 18:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              placeholder="e.g., Main Padel Court" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onCancel && (
          <Button 
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !scheduledDate}
          className={onCancel ? "" : "w-full"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule Game"
          )}
        </Button>
      </CardFooter>
    </>
  );
}
