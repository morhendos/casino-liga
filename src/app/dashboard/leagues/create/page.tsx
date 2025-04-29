"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Trophy, 
  Clock, 
  MapPin, 
  Users, 
  Save, 
  ChevronRight, 
  Info, 
  BarChart4, 
  AlertCircle,
  CheckCircle,
  Share2
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { SkewedButton } from "@/components/ui/SkewedButton";

function CreateLeaguePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(true);
  const [nameTouched, setNameTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [matchFormat, setMatchFormat] = useState("bestOf3");
  const [minTeams, setMinTeams] = useState(4);
  const [maxTeams, setMaxTeams] = useState(16);
  const [pointsPerWin, setPointsPerWin] = useState(3);
  const [pointsPerLoss, setPointsPerLoss] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  
  // Date selection
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>(undefined);
  
  // Validation
  const validateName = (value: string) => {
    const isValid = value.trim().length >= 3;
    setNameValid(isValid);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a league");
      return;
    }
    
    // Validate name
    if (!validateName(name)) {
      toast.error("League name must be at least 3 characters");
      return;
    }
    
    // Validate only if both dates are provided
    if (startDate && endDate && endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    // Validate only if both dates are provided
    if (startDate && registrationDeadline && registrationDeadline > startDate) {
      toast.error("Registration deadline must be on or before the start date");
      return;
    }
    
    if (minTeams > maxTeams) {
      toast.error("Minimum teams cannot be greater than maximum teams");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a base object without date fields
      const leagueData: any = {
        name: name.trim(),
        description: description.trim(),
        maxTeams,
        minTeams,
        matchFormat,
        venue: venue.trim(),
        pointsPerWin,
        pointsPerLoss,
        isPublic
      };
      
      // Only add date fields if they are valid dates
      if (startDate) {
        leagueData.startDate = startDate;
      }
      
      if (endDate) {
        leagueData.endDate = endDate;
      }
      
      if (registrationDeadline) {
        leagueData.registrationDeadline = registrationDeadline;
      }
      
      const response = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leagueData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create league");
      }
      
      const league = await response.json();
      
      toast.success("League created successfully", {
        description: "You can now add teams and generate a schedule."
      });
      
      // Redirect to league management page with fromCreate parameter
      router.push(`/dashboard/leagues/${league.id}/manage?fromCreate=true`);
    } catch (error) {
      console.error("Error creating league:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get format information
  const getFormatInfo = (format: string) => {
    switch (format) {
      case 'bestOf3': return "Playing best of 3 sets";
      case 'bestOf5': return "Playing best of 5 sets";
      case 'singleSet': return "Single set matches";
      default: return "";
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Geometric background elements */}
        <div className="fixed inset-0 -z-10 opacity-5 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-padeliga-purple rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 -left-12 w-72 h-72 bg-padeliga-teal rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-padeliga-orange rounded-full blur-3xl"></div>
        </div>
        
        {/* Header with skewed background */}
        <div className="relative mb-8 overflow-hidden rounded-md">
          <div 
            className="absolute inset-0 -z-10 bg-gradient-to-r from-padeliga-teal to-padeliga-blue opacity-20"
            style={{ transform: 'skew(-4deg) scale(1.1)' }}
          />
          <div className="py-8 px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded bg-padeliga-teal/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-padeliga-teal" />
              </div>
              <h1 className="text-3xl font-bold heading-accent">Create League</h1>
            </div>
            <p className="text-muted-foreground ml-14">
              Set up a new padel league with customized rules, schedule, and scoring.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column with tips and benefits */}
          <div className="md:col-span-1">
            {/* League Type Info Card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl mb-6">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-purple to-padeliga-teal"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-padeliga-purple/10 blur-xl"></div>
              <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-padeliga-teal/10 blur-xl"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3 mb-5">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-padeliga-purple/20">
                    <Info className="h-5 w-5 text-padeliga-purple" />
                  </div>
                  <h3 className="font-semibold text-gray-100">League Types</h3>
                </div>
                
                {/* League type cards */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-padeliga-teal">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-teal/20">
                        <Trophy className="h-3.5 w-3.5 text-padeliga-teal" />
                      </div>
                      <h4 className="font-medium text-gray-200">Regular Season</h4>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">
                      Players compete in a scheduled season with rankings and playoffs.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-padeliga-orange">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-orange/20">
                        <BarChart4 className="h-3.5 w-3.5 text-padeliga-orange" />
                      </div>
                      <h4 className="font-medium text-gray-200">Round Robin</h4>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">
                      Each team plays against all other teams in the league.
                    </p>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4 border-l-2 border-padeliga-purple">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-purple/20">
                        <Users className="h-3.5 w-3.5 text-padeliga-purple" />
                      </div>
                      <h4 className="font-medium text-gray-200">Team-Based</h4>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">
                      Players join as teams to compete against other teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits Card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-blue to-padeliga-purple"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-padeliga-blue/10 blur-xl"></div>
              <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-padeliga-purple/10 blur-xl"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3 mb-5">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-padeliga-blue/20">
                    <CheckCircle className="h-5 w-5 text-padeliga-blue" />
                  </div>
                  <h3 className="font-semibold text-gray-100">League Benefits</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-teal/20 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-padeliga-teal" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 text-sm">Automatic Scoring</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Points and rankings calculated automatically
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-teal/20 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-padeliga-teal" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 text-sm">Schedule Management</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Generate and manage match schedules easily
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-teal/20 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-padeliga-teal" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 text-sm">Player Statistics</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Track performance metrics for all players
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-padeliga-teal/20 mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5 text-padeliga-teal" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 text-sm">Public Sharing</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Optional public view for fans and spectators
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Visual timeline */}
                <div className="mt-8 pt-6 border-t border-gray-800/40">
                  <h4 className="text-sm font-medium text-gray-300 mb-4">League Creation Flow</h4>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-800"></div>
                    
                    {/* Steps */}
                    <div className="space-y-5">
                      {/* Step 1 */}
                      <div className="relative flex items-start pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-padeliga-teal/20 flex items-center justify-center z-10">
                          <span className="text-xs font-bold text-padeliga-teal">1</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-200">Create League</h5>
                          <p className="text-xs text-gray-400">Set up basic info and rules</p>
                        </div>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="relative flex items-start pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center z-10">
                          <span className="text-xs font-medium text-gray-400">2</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">Add Teams</h5>
                          <p className="text-xs text-gray-500">Invite players to participate</p>
                        </div>
                      </div>
                      
                      {/* Step 3 */}
                      <div className="relative flex items-start pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center z-10">
                          <span className="text-xs font-medium text-gray-400">3</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">Create Schedule</h5>
                          <p className="text-xs text-gray-500">Generate match schedule</p>
                        </div>
                      </div>
                      
                      {/* Step 4 */}
                      <div className="relative flex items-start pl-10">
                        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center z-10">
                          <span className="text-xs font-medium text-gray-400">4</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-400">Start League</h5>
                          <p className="text-xs text-gray-500">Begin collecting match results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column with the form */}
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-lg bg-gray-900/80 backdrop-blur-sm border border-gray-800/60 shadow-xl h-full">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-padeliga-teal to-padeliga-blue"></div>
              
              {/* Decorative background elements */}
              <div className="absolute -right-20 -bottom-20 w-40 h-40 rounded-full bg-padeliga-teal/10 blur-xl"></div>
              <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-padeliga-blue/10 blur-xl"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800/60 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded flex items-center justify-center bg-padeliga-teal/20 relative">
                      <Trophy className="h-5 w-5 text-padeliga-teal" />
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-padeliga-teal/20 rounded-full blur-md animate-pulse-slow"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">League Details</h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Fill in the details to create your new padel league
                      </p>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* League Name */}
                  <div className="relative">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-teal/10 mr-2">
                        <Trophy className="h-4 w-4 text-padeliga-teal" />
                      </div>
                      <label htmlFor="name" className="text-lg font-medium text-white">
                        League Name <span className="text-red-500">*</span>
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-padeliga-teal/20 to-transparent rounded-md blur-sm opacity-50"></div>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="Enter league name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setNameTouched(true);
                            validateName(e.target.value);
                          }}
                          required
                          className={cn(
                            "pl-4 py-6 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-teal transition-all duration-300",
                            "placeholder:text-gray-500 font-medium",
                            name && nameValid && "border-padeliga-green/50 focus:border-padeliga-green",
                            nameTouched && !nameValid && "border-red-500/70 focus:border-red-500"
                          )}
                          disabled={isSubmitting}
                        />
                        
                        {/* Validation icon */}
                        {nameTouched && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {nameValid ? (
                              <div className="bg-padeliga-green/10 p-1 rounded-full">
                                <CheckCircle className="h-5 w-5 text-padeliga-green" />
                              </div>
                            ) : (
                              <div className="bg-red-500/10 p-1 rounded-full">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2 ml-10">
                      Choose a distinctive name for your league that players can easily recognize.
                    </p>
                    
                    {/* Validation message */}
                    {nameTouched && !nameValid && (
                      <p className="text-sm text-red-500 mt-1 ml-10 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        League name must be at least 3 characters
                      </p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-purple/10 mr-2">
                        <Info className="h-4 w-4 text-padeliga-purple" />
                      </div>
                      <label htmlFor="description" className="text-lg font-medium text-white">
                        Description
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-padeliga-purple/20 to-transparent rounded-md blur-sm opacity-50"></div>
                      <Textarea
                        id="description"
                        placeholder="Describe your league, rules, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                        className="pl-4 py-3 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-purple transition-all duration-300 placeholder:text-gray-500"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2 ml-10">
                      Provide details about your league to help players understand what to expect.
                    </p>
                  </div>
                  
                  {/* Venue */}
                  <div className="space-y-2">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-orange/10 mr-2">
                        <MapPin className="h-4 w-4 text-padeliga-orange" />
                      </div>
                      <label htmlFor="venue" className="text-lg font-medium text-white">
                        Venue / Location
                      </label>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-padeliga-orange/20 to-transparent rounded-md blur-sm opacity-50"></div>
                      <Input
                        id="venue"
                        placeholder="Where will matches take place?"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-4 py-6 text-base bg-gray-800/70 border-gray-700 focus:border-padeliga-orange transition-all duration-300 placeholder:text-gray-500"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-400 mt-2 ml-10">
                      Specify where matches will be played, which is helpful for planning.
                    </p>
                  </div>
                  
                  {/* Dates Section */}
                  <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-800/60">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-blue/10 mr-2">
                        <Clock className="h-4 w-4 text-padeliga-blue" />
                      </div>
                      <h3 className="text-lg font-medium text-white">League Schedule</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Start Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-2">Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                "bg-gray-800/70 border-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300",
                                "pl-4 py-6 text-base",
                                !startDate && "text-gray-500"
                              )}
                              disabled={isSubmitting}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-padeliga-blue" />
                              {startDate ? format(startDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                            <div className="p-2 flex justify-between border-b border-gray-700">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setStartDate(undefined)}
                                disabled={!startDate}
                                type="button"
                                className="hover:bg-gray-700 text-gray-300"
                              >
                                Clear
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="bg-gray-800 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {/* End Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-2">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                "bg-gray-800/70 border-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300",
                                "pl-4 py-6 text-base",
                                !endDate && "text-gray-500"
                              )}
                              disabled={isSubmitting}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-padeliga-blue" />
                              {endDate ? format(endDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                            <div className="p-2 flex justify-between border-b border-gray-700">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEndDate(undefined)}
                                disabled={!endDate}
                                type="button"
                                className="hover:bg-gray-700 text-gray-300"
                              >
                                Clear
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              disabled={(date) => date < (startDate || new Date())}
                              initialFocus
                              className="bg-gray-800 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {/* Registration Deadline */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-2">Registration Deadline</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                "bg-gray-800/70 border-gray-700 hover:bg-gray-800 hover:text-white transition-all duration-300",
                                "pl-4 py-6 text-base",
                                !registrationDeadline && "text-gray-500"
                              )}
                              disabled={isSubmitting}
                              type="button"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-padeliga-blue" />
                              {registrationDeadline ? format(registrationDeadline, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                            <div className="p-2 flex justify-between border-b border-gray-700">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setRegistrationDeadline(undefined)}
                                disabled={!registrationDeadline}
                                type="button"
                                className="hover:bg-gray-700 text-gray-300"
                              >
                                Clear
                              </Button>
                            </div>
                            <Calendar
                              mode="single"
                              selected={registrationDeadline}
                              onSelect={setRegistrationDeadline}
                              disabled={(date) => {
                                // Must be today or later, and cannot be after start date
                                return date < new Date() || (startDate ? date > startDate : false);
                              }}
                              initialFocus
                              className="bg-gray-800 text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    {/* Timeline visualization */}
                    {(startDate || endDate || registrationDeadline) && (
                      <div className="mt-6 pt-4 border-t border-gray-700/50">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">League Timeline</h4>
                        <div className="relative h-16">
                          {/* Timeline track */}
                          <div className="absolute h-1.5 bg-gray-700 top-6 left-0 right-0 rounded-full"></div>
                          
                          {/* Registration Deadline */}
                          {registrationDeadline && (
                            <div className="absolute top-0 -ml-3" style={{ left: '25%' }}>
                              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              </div>
                              <div className="mt-1 text-xs text-amber-500 font-medium">Registration</div>
                              <div className="text-xs text-gray-500">{format(registrationDeadline, "MMM d")}</div>
                            </div>
                          )}
                          
                          {/* Start Date */}
                          {startDate && (
                            <div className="absolute top-0 -ml-3" style={{ left: '50%' }}>
                              <div className="w-6 h-6 rounded-full bg-padeliga-teal/20 flex items-center justify-center border border-padeliga-teal/40">
                                <div className="w-2 h-2 rounded-full bg-padeliga-teal"></div>
                              </div>
                              <div className="mt-1 text-xs text-padeliga-teal font-medium">Start</div>
                              <div className="text-xs text-gray-500">{format(startDate, "MMM d")}</div>
                            </div>
                          )}
                          
                          {/* End Date */}
                          {endDate && (
                            <div className="absolute top-0 -ml-3" style={{ left: '75%' }}>
                              <div className="w-6 h-6 rounded-full bg-padeliga-purple/20 flex items-center justify-center border border-padeliga-purple/40">
                                <div className="w-2 h-2 rounded-full bg-padeliga-purple"></div>
                              </div>
                              <div className="mt-1 text-xs text-padeliga-purple font-medium">End</div>
                              <div className="text-xs text-gray-500">{format(endDate, "MMM d")}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* League Settings Section */}
                  <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-800/60">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-purple/10 mr-2">
                        <Users className="h-4 w-4 text-padeliga-purple" />
                      </div>
                      <h3 className="text-lg font-medium text-white">League Settings</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Match Format */}
                      <div className="space-y-2">
                        <label htmlFor="matchFormat" className="text-sm font-medium text-gray-300 ml-2">Match Format *</label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-padeliga-blue/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={matchFormat}
                            onValueChange={setMatchFormat}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger 
                              id="matchFormat" 
                              className="bg-gray-800/70 border-gray-700 focus:border-padeliga-blue text-base py-6"
                            >
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="bestOf3" className="text-base">Best of 3 Sets</SelectItem>
                              <SelectItem value="bestOf5" className="text-base">Best of 5 Sets</SelectItem>
                              <SelectItem value="singleSet" className="text-base">Single Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Visual format hint */}
                        <div className="flex justify-center">
                          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                            {getFormatInfo(matchFormat)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Minimum Teams */}
                      <div className="space-y-2">
                        <label htmlFor="minTeams" className="text-sm font-medium text-gray-300 ml-2">Minimum Teams *</label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-padeliga-orange/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={minTeams.toString()}
                            onValueChange={(value) => setMinTeams(parseInt(value))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger 
                              id="minTeams" 
                              className="bg-gray-800/70 border-gray-700 focus:border-padeliga-orange text-base py-6"
                            >
                              <SelectValue placeholder="Select minimum" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {[2, 4, 6, 8, 10, 12].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="text-base">
                                  {num} teams
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Visual min teams hint */}
                        <div className="flex justify-center">
                          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                            {`Minimum ${minTeams} to start league`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Maximum Teams */}
                      <div className="space-y-2">
                        <label htmlFor="maxTeams" className="text-sm font-medium text-gray-300 ml-2">Maximum Teams *</label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-padeliga-purple/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={maxTeams.toString()}
                            onValueChange={(value) => setMaxTeams(parseInt(value))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger 
                              id="maxTeams" 
                              className="bg-gray-800/70 border-gray-700 focus:border-padeliga-purple text-base py-6"
                            >
                              <SelectValue placeholder="Select maximum" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {[4, 8, 12, 16, 24, 32].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="text-base">
                                  {num} teams
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Visual max teams hint */}
                        <div className="flex justify-center">
                          <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                            {`Limited to ${maxTeams} teams`}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Points Per Win */}
                      <div className="space-y-2">
                        <label htmlFor="pointsPerWin" className="text-sm font-medium text-gray-300 ml-2">Points Per Win</label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={pointsPerWin.toString()}
                            onValueChange={(value) => setPointsPerWin(parseInt(value))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger 
                              id="pointsPerWin" 
                              className="bg-gray-800/70 border-gray-700 focus:border-green-500 text-base py-6"
                            >
                              <SelectValue placeholder="Select points" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="text-base">
                                  {num} point{num !== 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Points Per Loss */}
                      <div className="space-y-2">
                        <label htmlFor="pointsPerLoss" className="text-sm font-medium text-gray-300 ml-2">Points Per Loss</label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent rounded-md blur-sm opacity-50"></div>
                          <Select
                            value={pointsPerLoss.toString()}
                            onValueChange={(value) => setPointsPerLoss(parseInt(value))}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger 
                              id="pointsPerLoss" 
                              className="bg-gray-800/70 border-gray-700 focus:border-amber-500 text-base py-6"
                            >
                              <SelectValue placeholder="Select points" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {[0, 1].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="text-base">
                                  {num} point{num !== 1 ? 's' : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visibility Options */}
                  <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-800/60">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-padeliga-blue/10 mr-2">
                        <Share2 className="h-4 w-4 text-padeliga-blue" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Visibility</h3>
                    </div>
                    
                    <div className="flex items-center space-x-3 bg-gray-800/70 p-4 rounded-md border border-gray-700">
                      <Checkbox
                        id="isPublic"
                        checked={isPublic}
                        onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                        disabled={isSubmitting}
                        className="data-[state=checked]:bg-padeliga-blue data-[state=checked]:border-padeliga-blue h-5 w-5"
                      />
                      <div className="space-y-1">
                        <label htmlFor="isPublic" className="text-base font-medium text-white">
                          Make this league publicly viewable
                        </label>
                        <p className="text-sm text-gray-400">
                          When enabled, anyone can view this league without logging in.
                          League details, rankings, and match results will be publicly accessible.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button Section */}
                  <div className="mt-10 pt-6 border-t border-gray-800/50">
                    <div className="flex justify-between">
                      <Link href="/dashboard/leagues">
                        <SkewedButton
                          buttonVariant="outline"
                          hoverEffectColor="purple"
                          hoverEffectVariant="outline"
                          type="button"
                          disabled={isSubmitting}
                          className="text-gray-200 border border-gray-600 hover:bg-gray-800/60"
                        >
                          Cancel & Return
                        </SkewedButton>
                      </Link>
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          "relative overflow-hidden group px-8 py-4 min-w-[200px]",
                          "bg-gradient-to-r from-padeliga-teal to-padeliga-blue rounded-md",
                          "shadow-lg shadow-padeliga-teal/20",
                          "transform transition-all duration-300",
                          "hover:scale-[1.02] active:scale-[0.98]",
                          "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        )}
                      >
                        {/* Background effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        
                        {/* Shine effect */}
                        <div 
                          className="absolute -inset-full top-0 block w-1/2 h-full z-5 transform -skew-x-20 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"
                        ></div>
                        
                        {/* Button content */}
                        <div className="relative z-10 flex items-center justify-center">
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span className="text-white font-semibold">Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Save className="h-5 w-5 mr-2 text-white" />
                              <span className="text-white font-semibold">Create League</span>
                              <ChevronRight className="h-5 w-5 ml-1 text-white/80 transition-transform group-hover:translate-x-1" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use withRoleAuth instead of withAuth, requiring the admin role
export default withRoleAuth(CreateLeaguePage, [ROLES.ADMIN]);