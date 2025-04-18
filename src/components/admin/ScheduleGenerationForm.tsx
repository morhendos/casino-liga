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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Info, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";

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

// Define the form schema
const formSchema = z.object({
  algorithm: z.string().default("round-robin"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  matchesPerDay: z.coerce.number().int().min(1).default(1),
  venue: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

  // Parse the date strings into Date objects
  const defaultStartDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const defaultEndDate = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // Calculate required matches for round-robin
  const requiredMatches = teamsCount > 0 ? (teamsCount * (teamsCount - 1)) / 2 : 0;

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      algorithm: "round-robin",
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      matchesPerDay: 1,
      venue: venue || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsGenerating(true);
      
      // Using the existing API endpoint for schedule generation
      const response = await fetch(`/api/leagues/${leagueId}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
  const availableDays = form.watch("startDate") && form.watch("endDate") ? 
    Math.floor((form.watch("endDate")!.getTime() - form.watch("startDate")!.getTime()) / (1000 * 60 * 60 * 24)) + 1 
    : 0;

  // Calculate if there are enough days for the schedule
  const matchesPerDay = form.watch("matchesPerDay") || 1;
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="algorithm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduling Algorithm</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isGenerating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an algorithm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedulingAlgorithms.map((algorithm) => (
                        <SelectItem 
                          key={algorithm.id} 
                          value={algorithm.id}
                          disabled={algorithm.disabled}
                        >
                          {algorithm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {schedulingAlgorithms.find(a => a.id === field.value)?.description}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full pl-3 text-left font-normal"
                            }
                            disabled={isGenerating}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            (form.watch("endDate") ? date > form.watch("endDate")! : false)
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={
                              "w-full pl-3 text-left font-normal"
                            }
                            disabled={isGenerating}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            form.watch("startDate") ? date < form.watch("startDate")! : date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="matchesPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matches Per Day</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field} 
                      disabled={isGenerating} 
                    />
                  </FormControl>
                  <FormDescription>
                    For {requiredMatches} total matches, you need at least {daysNeeded} days at this rate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Venue (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Main Sports Hall" 
                      {...field} 
                      value={field.value || ""}
                      disabled={isGenerating} 
                    />
                  </FormControl>
                  <FormDescription>
                    Will be applied to all matches
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          onClick={() => form.reset()}
          variant="outline"
          disabled={isGenerating}
        >
          Reset
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
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