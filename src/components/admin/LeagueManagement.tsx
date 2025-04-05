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
import { Search, Trophy, Plus, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
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

export function LeagueManagement() {
  const { data: session } = useSession();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchLeagues = async () => {
    try {
      setIsLoading(true);
      let url = '/api/leagues';
      
      // Add search params if provided
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('name', searchTerm);
      }
      
      if (statusFilter) {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
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
              <SelectItem value="">All Statuses</SelectItem>
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
                  <TableHead>Teams</TableHead>
                  <TableHead>Schedule</TableHead>
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
                  leagues.map((league) => (
                    <TableRow key={league.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/leagues/${league.id}`} className="hover:underline">
                          {league.name}
                        </Link>
                      </TableCell>
                      <TableCell>{getStatusBadge(league.status)}</TableCell>
                      <TableCell>{league.teams.length} teams</TableCell>
                      <TableCell>
                        {league.scheduleGenerated ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Generated</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">Not Generated</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <div>Start: {new Date(league.startDate).toLocaleDateString()}</div>
                          <div>End: {new Date(league.endDate).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/leagues/${league.id}`}>
                              <Trophy className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          
                          {league.status !== 'canceled' && league.status !== 'completed' && (
                            <Button size="sm" asChild>
                              <Link href={`/dashboard/leagues/${league.id}/manage`}>
                                Manage
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-8">
                        <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No leagues found</p>
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
