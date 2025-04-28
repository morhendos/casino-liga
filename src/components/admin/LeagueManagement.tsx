"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Trophy, Plus, Users, Calendar, AlertCircle, CheckCircle, Play, PencilLine, Settings, Sliders } from "lucide-react";
import Link from "next/link";

interface League {
  id: string;
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  teams: any[];
  scheduleGenerated: boolean;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
}

function LeagueManagement() {
  const { data: session } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchLeagues = async () => {
    try {
      setIsLoading(true);
      let url = '/api/leagues';
      
      // Add search params if provided
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('name', searchTerm);
      }
      
      if (statusFilter && statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch leagues");
      }
      
      const data = await response.json();
      
      if (data.leagues) {
        // Process the leagues to ensure IDs are normalized
        const processedLeagues = data.leagues.map((league: any) => ({
          ...league,
          id: league._id || league.id
        }));
        setLeagues(processedLeagues);
      }
    } catch (error) {
      console.error("Error fetching leagues:", error);
      toast.error("Failed to load leagues");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchLeagues();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'registration':
        return <Badge variant="secondary">Registration</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'completed':
        return <Badge variant="success" className="bg-green-500">Completed</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get recommended action for a league based on its status
  const getRecommendedAction = (league: League) => {
    // If the league has no teams, recommend adding teams first
    if (league.teams.length === 0) {
      return {
        label: "Add Teams",
        href: `/dashboard/leagues/${league.id}/manage?tab=teams`,
        icon: <Users className="h-4 w-4 mr-1" />,
        isPrimary: true
      };
    }
    
    // If the league has teams but no schedule, recommend generating schedule
    if (!league.scheduleGenerated && league.teams.length >= 2) {
      return {
        label: "Generate Schedule",
        href: `/dashboard/leagues/${league.id}/manage?tab=schedule`,
        icon: <Calendar className="h-4 w-4 mr-1" />,
        isPrimary: true
      };
    }
    
    // Status-specific actions
    switch(league.status) {
      case 'draft':
        return {
          label: "Open Registration",
          href: `/dashboard/leagues/${league.id}/manage`,
          icon: <Play className="h-4 w-4 mr-1" />,
          isPrimary: true
        };
        
      case 'registration':
        return {
          label: "Start League",
          href: `/dashboard/leagues/${league.id}/manage`,
          icon: <Play className="h-4 w-4 mr-1" />,
          isPrimary: league.scheduleGenerated && league.teams.length >= 2
        };
        
      case 'active':
        return {
          label: "Record Results",
          href: `/dashboard/leagues/${league.id}/matches`,
          icon: <PencilLine className="h-4 w-4 mr-1" />,
          isPrimary: true
        };
        
      case 'completed':
        return {
          label: "View Results",
          href: `/dashboard/leagues/${league.id}/rankings`,
          icon: <Trophy className="h-4 w-4 mr-1" />,
          isPrimary: false
        };
        
      default:
        return {
          label: "Manage",
          href: `/dashboard/leagues/${league.id}/manage`,
          icon: <Settings className="h-4 w-4 mr-1" />,
          isPrimary: false
        };
    }
  };

  // Format dates for consistency
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid date";
    }
  };

  // Determine if league setup is complete
  const isLeagueSetupComplete = (league: League) => {
    return league.teams.length >= 2 && league.scheduleGenerated;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="Search leagues by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} type="button">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="registration">Registration</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button asChild>
            <Link href="/dashboard/leagues/create">
              <Plus className="h-4 w-4 mr-2" />
              New League
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>League Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-8 text-muted-foreground animate-pulse">
                        Loading leagues...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leagues.length > 0 ? (
                  leagues.map((league) => {
                    const recommendedAction = getRecommendedAction(league);
                    return (
                      <TableRow key={league.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/leagues/${league.id}`} className="hover:underline">
                            {league.name}
                          </Link>
                        </TableCell>
                        <TableCell>{getStatusBadge(league.status)}</TableCell>
                        <TableCell>
                          {isLeagueSetupComplete(league) ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Complete</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-amber-600">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Incomplete</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{league.teams.length}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {league.scheduleGenerated ? (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Schedule ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>No schedule</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div className="flex items-center mb-1">
                              <span className="font-medium w-10">Start:</span> 
                              {formatDate(league.startDate)}
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium w-10">End:</span> 
                              {formatDate(league.endDate)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant={recommendedAction.isPrimary ? "default" : "outline"} 
                              size="sm" 
                              asChild
                            >
                              <Link href={recommendedAction.href}>
                                {recommendedAction.icon}
                                {recommendedAction.label}
                              </Link>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-2" 
                              asChild
                            >
                              <Link href={`/dashboard/leagues/${league.id}/manage`}>
                                <Sliders className="h-4 w-4" />
                                <span className="sr-only">All Settings</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-8">
                        <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No leagues found</p>
                        {searchTerm && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Try a different search term
                          </p>
                        )}
                        <Button
                          className="mt-4"
                          asChild
                        >
                          <Link href="/dashboard/leagues/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create League
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Change from named export to default export
export default LeagueManagement;