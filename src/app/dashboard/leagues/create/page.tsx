"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";

function CreateLeaguePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [matchFormat, setMatchFormat] = useState("bestOf3");
  const [minTeams, setMinTeams] = useState(4);
  const [maxTeams, setMaxTeams] = useState(16);
  const [pointsPerWin, setPointsPerWin] = useState(3);
  const [pointsPerLoss, setPointsPerLoss] = useState(0);
  
  // Date selection
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>(undefined);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to create a league");
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
        pointsPerLoss
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
      
      // Redirect to league details
      router.push(`/dashboard/leagues/${league.id}/manage`);
    } catch (error) {
      console.error("Error creating league:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create league");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New League</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
            <CardDescription>
              Create a new padel league for players to join and compete.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">League Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter league name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your league, rules, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue / Location</Label>
                <Input
                  id="venue"
                  placeholder="Where will matches take place?"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 flex justify-between border-b">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setStartDate(undefined)}
                          disabled={!startDate}
                          type="button"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 flex justify-between border-b">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEndDate(undefined)}
                          disabled={!endDate}
                          type="button"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Registration Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !registrationDeadline && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {registrationDeadline ? format(registrationDeadline, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 flex justify-between border-b">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setRegistrationDeadline(undefined)}
                          disabled={!registrationDeadline}
                          type="button"
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="matchFormat">Match Format *</Label>
                  <Select
                    value={matchFormat}
                    onValueChange={setMatchFormat}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="matchFormat">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bestOf3">Best of 3 Sets</SelectItem>
                      <SelectItem value="bestOf5">Best of 5 Sets</SelectItem>
                      <SelectItem value="singleSet">Single Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minTeams">Minimum Teams *</Label>
                  <Select
                    value={minTeams.toString()}
                    onValueChange={(value) => setMinTeams(parseInt(value))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="minTeams">
                      <SelectValue placeholder="Select minimum" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 10, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} teams
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxTeams">Maximum Teams *</Label>
                  <Select
                    value={maxTeams.toString()}
                    onValueChange={(value) => setMaxTeams(parseInt(value))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="maxTeams">
                      <SelectValue placeholder="Select maximum" />
                    </SelectTrigger>
                    <SelectContent>
                      {[4, 8, 12, 16, 24, 32].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} teams
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pointsPerWin">Points Per Win</Label>
                  <Select
                    value={pointsPerWin.toString()}
                    onValueChange={(value) => setPointsPerWin(parseInt(value))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="pointsPerWin">
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} point{num !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pointsPerLoss">Points Per Loss</Label>
                  <Select
                    value={pointsPerLoss.toString()}
                    onValueChange={(value) => setPointsPerLoss(parseInt(value))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="pointsPerLoss">
                      <SelectValue placeholder="Select points" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} point{num !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/dashboard/leagues")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create League"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Use withRoleAuth instead of withAuth, requiring the admin role
export default withRoleAuth(CreateLeaguePage, [ROLES.ADMIN]);