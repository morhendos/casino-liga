"use client";

import { useState } from "react";
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

interface ScheduleGenerationFormProps {
  leagueId: string;
  teamsCount: number;
  minTeams: number;
  startDate: Date | string;
  endDate: Date | string;
  venue?: string;
  onScheduleGenerated: () => void;
}

const schedulingAlgorithms = [
  { id: "round-robin", name: "Round Robin", description: "Each team plays against every other team once" },
  { id: "double-round-robin", name: "Double Round Robin", description: "Each team plays against every other team twice (home and away)", disabled: true },
];

export default function ScheduleGenerationForm({
  leagueId,
  teamsCount,
  minTeams,
  startDate,
  endDate,
  venue,
  onScheduleGenerated
}: ScheduleGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [algorithm, setAlgorithm] = useState("round-robin");
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    typeof startDate === 'string' ? new Date(startDate) : startDate
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    typeof endDate === 'string' ? new Date(endDate) : endDate
  );
  const [matchesPerDay, setMatchesPerDay] = useState(1);
  const [venueValue, setVenueValue] = useState(venue || "");

  // Parse the date strings into Date objects
  const defaultStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const defaultEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // Calculate required matches for round-robin
  const requiredMatches = teamsCount > 0 ? (teamsCount * (teamsCount - 1)) / 2 : 0;

  // Handle form submission
  const onSubmit = async () => {
    try {
      setIsGenerating(true);
      
      // Using the existing API endpoint for schedule generation
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          algorithm,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          matchesPerDay,
          venue: venueValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate schedule");
      }

      // Successfully generated schedule
      const result = await response.json();
      
      toast.success(`Successfully generated schedule with ${result.matches?.length || 0} matches!`);
      
      // Notify parent component that schedule has been generated
      onScheduleGenerated();
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  };

  // Not enough teams warning
  const hasEnoughTeams = teamsCount >= minTeams;

  // Calculate available days between start and end dates
  const availableDays = selectedStartDate && selectedEndDate ? 
    Math.floor((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 
    : 0;

  // Calculate if there are enough days for the schedule
  const daysNeeded = Math.ceil(requiredMatches / matchesPerDay);
  const hasEnoughDays = availableDays >= daysNeeded;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generate League Schedule</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowInfo(!showInfo)}
            aria-label={showInfo ? "Hide schedule information" : "Show schedule information"}
          >
            <Info className="h-5 w-5" />
          </Button>
        </CardTitle>
        <CardDescription>
          Create a match schedule for all teams in this league
        </CardDescription>
      </CardHeader>

      {showInfo && (
        <div className="px-6 pb-4">
          <div className="bg-muted p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">Schedule Generation Information</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                <span>For {teamsCount} teams, a round-robin schedule requires {requiredMatches} matches</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                <span>League dates: {defaultStartDate?.toLocaleDateString()} to {defaultEndDate?.toLocaleDateString()}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                <span>Schedule can be regenerated if no matches have been played</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Scheduling Algorithm</Label>
            <Select 
              value={algorithm} 
              onValueChange={setAlgorithm}
              disabled={isGenerating}
            >
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select an algorithm" />
              </SelectTrigger>
              <SelectContent>
                {schedulingAlgorithms.map((algo) => (
                  <SelectItem 
                    key={algo.id} 
                    value={algo.id}
                    disabled={algo.disabled}
                  >
                    {algo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {schedulingAlgorithms.find(a => a.id === algorithm)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant={"outline"}
                    className={"w-full pl-3 text-left font-normal"}
                    disabled={isGenerating}
                  >
                    {selectedStartDate ? (
                      format(selectedStartDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      (selectedEndDate ? date > selectedEndDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant={"outline"}
                    className={"w-full pl-3 text-left font-normal"}
                    disabled={isGenerating}
                  >
                    {selectedEndDate ? (
                      format(selectedEndDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    disabled={(date) =>
                      selectedStartDate ? date < selectedStartDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="matchesPerDay">Matches Per Day</Label>
            <Input 
              id="matchesPerDay"
              type="number" 
              min={1} 
              value={matchesPerDay}
              onChange={(e) => setMatchesPerDay(parseInt(e.target.value) || 1)}
              disabled={isGenerating} 
            />
            <p className="text-sm text-muted-foreground">
              For {requiredMatches} total matches, you need at least {daysNeeded} days at this rate
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Default Venue (Optional)</Label>
            <Input 
              id="venue"
              placeholder="e.g., Main Sports Hall" 
              value={venueValue}
              onChange={(e) => setVenueValue(e.target.value)}
              disabled={isGenerating} 
            />
            <p className="text-sm text-muted-foreground">
              Will be applied to all matches
            </p>
          </div>

          {!hasEnoughTeams && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <p className="font-medium">Not Enough Teams</p>
              <p>You need at least {minTeams} teams to generate a schedule. Currently have {teamsCount}.</p>
            </div>
          )}

          {hasEnoughTeams && availableDays > 0 && !hasEnoughDays && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <p className="font-medium">Not Enough Days</p>
              <p>
                You need at least {daysNeeded} days for {requiredMatches} matches at {matchesPerDay} matches per day. 
                Current date range has {availableDays} days.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          onClick={() => {
            setAlgorithm("round-robin");
            setSelectedStartDate(typeof startDate === 'string' ? new Date(startDate) : startDate);
            setSelectedEndDate(typeof endDate === 'string' ? new Date(endDate) : endDate);
            setMatchesPerDay(1);
            setVenueValue(venue || "");
          }}
          variant="outline"
          disabled={isGenerating}
        >
          Reset
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isGenerating || !hasEnoughTeams || !hasEnoughDays}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Schedule"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}