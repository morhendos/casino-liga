'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PlayerPerformanceProps {
  playerId: string;
  leagueId?: string; // Optional - if provided, stats are for this league only
}

export default function PlayerPerformanceCard({ playerId, leagueId }: PlayerPerformanceProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Construct the API URL based on whether a leagueId is provided
        const url = leagueId
          ? `/api/players/${playerId}/stats?leagueId=${leagueId}`
          : `/api/players/${playerId}/stats`;

        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch player stats');
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching player stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [playerId, leagueId]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-6">
          <div className="text-destructive mb-2">Unable to load player statistics</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </CardContent>
      </Card>
    );
  }
  
  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-6">
          <div className="text-muted-foreground">No statistics available for this player</div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate win rate trend indicator
  const TrendIcon = stats.winRateTrend > 0 
    ? TrendingUp 
    : stats.winRateTrend < 0 
      ? TrendingDown 
      : Minus;
  
  const trendColor = stats.winRateTrend > 0 
    ? 'text-green-500' 
    : stats.winRateTrend < 0 
      ? 'text-red-500' 
      : 'text-gray-500';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{stats.playerName}</CardTitle>
        <CardDescription>
          {leagueId ? 'League Performance' : 'Overall Performance'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Win/Loss Record</span>
            <span className="font-medium">
              {stats.wins} - {stats.losses}
              {stats.winRateTrend !== 0 && (
                <TrendIcon className={`inline ml-1 h-4 w-4 ${trendColor}`} />
              )}
            </span>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Win Rate</span>
              <span className="font-medium">{stats.winRate}%</span>
            </div>
            <Progress 
              value={stats.winRate} 
              variant={stats.winRate >= stats.leagueAvgWinRate ? "success" : "default"}
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>vs. League Avg: {stats.leagueAvgWinRate}%</span>
              {stats.winRate > stats.leagueAvgWinRate ? (
                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                  +{(stats.winRate - stats.leagueAvgWinRate).toFixed(1)}%
                </Badge>
              ) : stats.winRate < stats.leagueAvgWinRate ? (
                <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">
                  {(stats.winRate - stats.leagueAvgWinRate).toFixed(1)}%
                </Badge>
              ) : (
                <Badge variant="outline">Equal</Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Sets Won</span>
              <span className="font-medium">{stats.setsWonPercentage}%</span>
            </div>
            <Progress 
              value={stats.setsWonPercentage} 
              variant="info"
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Total: {stats.setsWon} / {stats.totalSets}</span>
              <span>Avg Score: {stats.averageScore}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="text-lg font-medium">{stats.lastFiveMatches[0]}</div>
              <div className="text-xs text-muted-foreground">Last</div>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="text-lg font-medium">{stats.consecutiveWins}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            <div className="flex flex-col items-center p-2 border rounded-md">
              <div className="text-lg font-medium">{stats.bestScore}</div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}