"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";
import { DeleteLeagueButton } from "@/components/admin/DeleteLeagueButton";

function EditLeaguePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract the ID from params
  const leagueId = params?.id as string;
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [matchFormat, setMatchFormat] = useState("bestOf3");
  const [minTeams, setMinTeams] = useState(4);
  const [maxTeams, setMaxTeams] = useState(16);
  const [pointsPerWin, setPointsPerWin] = useState(3);
  const [pointsPerLoss, setPointsPerLoss] = useState(0);
  const [status, setStatus] = useState("draft");
  
  // Date selection
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (!leagueId || leagueId === "undefined") {
      setError("Invalid league ID");
      setIsLoading(false);
      return;
    }
    
    async function fetchLeagueDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/leagues/${leagueId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching league: ${response.statusText}`);
        }
        
        const league = await response.json();
        
        // Set form values from league data
        setName(league.name || "");
        setDescription(league.description || "");
        setVenue(league.venue || "");
        setMatchFormat(league.matchFormat || "bestOf3");
        setMinTeams(league.minTeams || 4);
        setMaxTeams(league.maxTeams || 16);
        setPointsPerWin(league.pointsPerWin || 3);
        setPointsPerLoss(league.pointsPerLoss || 0);
        setStatus(league.status || "draft");
        
        // Set dates if available
        if (league.startDate) {
          setStartDate(new Date(league.startDate));
        }
        
        if (league.endDate) {
          setEndDate(new Date(league.endDate));
        }
        
        if (league.registrationDeadline) {
          setRegistrationDeadline(new Date(league.registrationDeadline));
        }
      } catch (error) {
        console.error("Error fetching league details:", error);
        setError("Failed to load league details");
        toast.error("Failed to load league details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLeagueDetails();
  }, [leagueId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to update a league");
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
        status,
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
      
      const response = await fetch(`/api/leagues/${leagueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leagueData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update league");
      }
      
      toast.success("League updated successfully");
      
      // Navigate back to league management page
      router.push(`/dashboard/leagues/${leagueId}/manage`);
    } catch (error) {
      console.error("Error updating league:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update league");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle league deletion callback
  const handleLeagueDeleted = () => {
    // Redirect to the leagues list after successful deletion
    router.push('/dashboard/leagues');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse text-center">
          <h2 className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></h2>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded w-full max-w-3xl mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/leagues')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leagues
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            asChild
          >
            <Link href={`/dashboard/leagues/${leagueId}/manage`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Management
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit League</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>League Details</CardTitle>
            <CardDescription>
              Update your league details
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={setStatus}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex sm:flex-row flex-col gap-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/leagues/${leagueId}/manage`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <DeleteLeagueButton 
                  leagueId={leagueId} 
                  leagueName={name}
                  onDeleted={handleLeagueDeleted}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Use withRoleAuth instead of withAuth, requiring the admin role
export default withRoleAuth(EditLeaguePage, [ROLES.ADMIN]);