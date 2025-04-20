"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Info, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Team {
  id: string;
  _id?: string;
  name: string;
  players: any[];
}

interface GameCreationFormProps {
  leagueId: string;
  teams: Team[];
  onGameCreated: () => void;
}

export default function GameCreationForm({
  leagueId,
  teams,
  onGameCreated
}: GameCreationFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [teamAId, setTeamAId] = useState<string>("");
  const [teamBId, setTeamBId] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date());
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Reset form
  const resetForm = () => {
    setTeamAId("");
    setTeamBId("");
    setScheduledDate(new Date());
    setScheduledTime("");
    setLocation("");
  };

  // Handle form submission
  const onSubmit = async () => {
    // Validation
    if (!teamAId || !teamBId) {
      toast.error("Please select both teams");
      return;
    }

    if (teamAId === teamBId) {
      toast.error("Teams must be different");
      return;
    }

    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setIsCreating(true);
      
      // Call the match creation API
      const response = await fetch(`/api/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leagueId,
          teamAId,
          teamBId,
          scheduledDate,
          scheduledTime,
          location
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create game");
      }

      // Successfully created the game
      const result = await response.json();
      
      toast.success("Game created successfully!");
      
      // Reset form after successful creation
      resetForm();
      
      // Notify parent component
      onGameCreated();
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create game");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Game</CardTitle>
        <CardDescription>
          Schedule a game between two teams in this league
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="teamA">Team A</Label>
              <Select 
                value={teamAId} 
                onValueChange={setTeamAId}
                disabled={isCreating}
              >
                <SelectTrigger id="teamA">
                  <SelectValue placeholder="Select first team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem 
                      key={team.id || team._id} 
                      value={team.id || team._id || ""}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamB">Team B</Label>
              <Select 
                value={teamBId} 
                onValueChange={setTeamBId}
                disabled={isCreating}
              >
                <SelectTrigger id="teamB">
                  <SelectValue placeholder="Select second team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem 
                      key={team.id || team._id} 
                      value={team.id || team._id || ""}
                      disabled={team.id === teamAId || team._id === teamAId}
                    >
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Game Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={"w-full pl-3 text-left font-normal"}
                    disabled={isCreating}
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
              <Label htmlFor="time">Game Time (Optional)</Label>
              <Input 
                id="time"
                type="time" 
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={isCreating} 
                placeholder="e.g., 18:00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input 
              id="location"
              placeholder="e.g., Main Padel Court" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isCreating} 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={resetForm}
          variant="outline"
          disabled={isCreating}
        >
          Reset
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isCreating || !teamAId || !teamBId || !scheduledDate}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Game"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
