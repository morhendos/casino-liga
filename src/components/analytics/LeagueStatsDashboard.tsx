'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, BarChart, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeagueStatsProps {
  leagueId: string;
}

export default function LeagueStatsDashboard({ leagueId }: LeagueStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/leagues/${leagueId}/stats`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch league stats');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching league stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [leagueId]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="my-8">
        <CardContent className="flex flex-col items-center py-10">
          <div className="text-destructive mb-2">Unable to load statistics</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card className="my-8">
        <CardContent className="flex flex-col items-center py-10">
          <div className="text-muted-foreground">No statistics available</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><Activity className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
          <TabsTrigger value="matches"><BarChart className="h-4 w-4 mr-2" /> Matches</TabsTrigger>
          <TabsTrigger value="teams"><PieChart className="h-4 w-4 mr-2" /> Teams</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
                <Progress value={stats.completionPercentage} variant="success" className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.completedMatches} of {stats.totalMatches} matches completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Player Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.participationRate}%</div>
                <Progress value={stats.participationRate} variant="info" className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.activePlayers} of {stats.totalPlayers} players active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Sets Per Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageSetsPerMatch.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Most common score: {stats.mostCommonScore}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>League Activity</CardTitle>
              <CardContent className="px-0">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xl font-bold">{stats.matchesThisWeek}</div>
                    <div className="text-xs text-muted-foreground">Matches This Week</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xl font-bold">{stats.matchesLastWeek}</div>
                    <div className="text-xs text-muted-foreground">Matches Last Week</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xl font-bold">{stats.averagePoints.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Avg Points Per Team</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xl font-bold">{stats.daysRemaining}</div>
                    <div className="text-xs text-muted-foreground">Days Remaining</div>
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </TabsContent>
        
        <TabsContent value="matches" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Match Outcomes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-3 border rounded-md">
                      <div className="text-lg font-bold">{stats.matchTypes?.decisive || 0}</div>
                      <div className="text-xs text-muted-foreground">Decisive</div>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-md">
                      <div className="text-lg font-bold">{stats.matchTypes?.close || 0}</div>
                      <div className="text-xs text-muted-foreground">Close</div>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded-md">
                      <div className="text-lg font-bold">{stats.matchTypes?.tiebreak || 0}</div>
                      <div className="text-xs text-muted-foreground">Tiebreak</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Sets Distribution</h3>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={stats.setsDistribution?.twoSets || 0} 
                      className="flex-1 h-2" 
                      variant="success" 
                    />
                    <span className="text-xs">{stats.setsDistribution?.twoSets || 0}% in 2 sets</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Progress 
                      value={stats.setsDistribution?.threeSets || 0} 
                      className="flex-1 h-2"
                      variant="info"
                    />
                    <span className="text-xs">{stats.setsDistribution?.threeSets || 0}% in 3 sets</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Top Performers</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.topTeams?.map((team: any, index: number) => (
                      <div key={team.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-2">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-xs text-muted-foreground">{team.winRate}% win rate</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{team.wins}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-medium">{team.losses}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}