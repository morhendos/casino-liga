"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar as CalendarIcon, ListFilter, Grid, List, Printer } from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

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

interface Team {
  id: string;
  _id: string;
  name: string;
}

interface ScheduleVisualizationProps {
  matches: Match[];
  teams: Team[];
  onMatchClick: (matchId: string) => void;
}

export default function ScheduleVisualization({
  matches,
  teams,
  onMatchClick
}: ScheduleVisualizationProps) {
  const [viewType, setViewType] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filteredTeam, setFilteredTeam] = useState<string>("all");
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(matches);
  
  // Update filtered matches when filter changes
  useEffect(() => {
    if (filteredTeam && filteredTeam !== "all") {
      setFilteredMatches(
        matches.filter(
          match => 
            match.teamA.id === filteredTeam || 
            match.teamB.id === filteredTeam
        )
      );
    } else {
      setFilteredMatches(matches);
    }
  }, [filteredTeam, matches]);

  // Function to print the schedule
  const handlePrintSchedule = () => {
    window.print();
  };

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

  // Calendar View Component
  const CalendarView = () => {
    // Get days for the current month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Navigate to previous month
    const prevMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() - 1);
      setCurrentDate(newDate);
    };
    
    // Navigate to next month
    const nextMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + 1);
      setCurrentDate(newDate);
    };
    
    // Get matches for a specific day
    const getMatchesForDay = (day: Date) => {
      return filteredMatches.filter(match => {
        const matchDate = new Date(match.scheduledDate);
        return isSameDay(matchDate, day);
      });
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              &lt;
            </Button>
            <h3 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              &gt;
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day labels */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={day} className="text-center font-medium text-sm py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: new Date(monthStart).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 border rounded-md bg-gray-50"></div>
          ))}
          
          {/* Days of the month */}
          {days.map((day) => {
            const dayMatches = getMatchesForDay(day);
            const hasMatches = dayMatches.length > 0;
            
            return (
              <div 
                key={day.toString()} 
                className={`h-28 border rounded-md p-1 overflow-hidden ${
                  hasMatches ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="text-xs font-medium p-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayMatches.slice(0, 2).map(match => (
                    <div 
                      key={match.id || match._id} 
                      className="bg-white p-1 text-xs rounded border cursor-pointer hover:bg-gray-50"
                      onClick={() => onMatchClick(match.id || match._id)}
                    >
                      <div className="truncate">{match.teamA.name} vs {match.teamB.name}</div>
                      <div className="text-muted-foreground truncate">{match.scheduledTime || 'TBD'}</div>
                    </div>
                  ))}
                  
                  {dayMatches.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayMatches.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List View Component
  const ListView = () => {
    // Group matches by date
    const matchesByDate: Record<string, Match[]> = {};
    
    // Sort matches by date
    const sortedMatches = [...filteredMatches].sort((a, b) => {
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
    
    if (sortedDates.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No matches found for selected filters.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sortedDates.map(date => (
          <div key={date} className="border rounded-md overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium">
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
            
            <div className="divide-y">
              {matchesByDate[date].map(match => (
                <div 
                  key={match.id || match._id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onMatchClick(match.id || match._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{match.teamA.name}</div>
                    </div>
                    
                    <div className="px-4 text-center">
                      {match.status === 'completed' && match.result ? (
                        <div className="font-bold">
                          {match.result.teamAScore.join('-')} vs {match.result.teamBScore.join('-')}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          {match.scheduledTime || 'TBD'}
                        </div>
                      )}
                      
                      <div className="mt-1">
                        {getStatusBadge(match.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 text-right">
                      <div className="font-medium">{match.teamB.name}</div>
                    </div>
                  </div>
                  
                  {match.location && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Location: {match.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Visualization</CardTitle>
        <CardDescription>
          View and filter the league match schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-1 items-center space-x-2">
              <div className="flex items-center space-x-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Filter:</span>
              </div>
              
              <Select value={filteredTeam} onValueChange={setFilteredTeam}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id || team._id} value={team.id || team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs defaultValue="calendar" onValueChange={(v) => setViewType(v as "calendar" | "list")}>
                <TabsList className="grid grid-cols-2 w-[180px]">
                  <TabsTrigger value="calendar" className="flex items-center">
                    <Grid className="h-4 w-4 mr-2" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="icon" onClick={handlePrintSchedule} className="ml-2">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* View content */}
          <div className="mt-4">
            {viewType === "calendar" ? <CalendarView /> : <ListView />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}