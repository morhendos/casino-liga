'use client';

import { useState, useEffect } from 'react';
import { PlayerPerformanceCard } from '@/components/analytics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  nickname: string;
  name?: string;
}

interface PlayerAnalyticsPanelProps {
  leagueId: string;
}

export function PlayerAnalyticsPanel({ leagueId }: PlayerAnalyticsPanelProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch all players in the league
  useEffect(() => {
    async function fetchPlayers() {
      setIsLoading(true);
      setError(null);
      setIsAuthError(false);
      
      try {
        // Get all players for this league
        const response = await fetch(`/api/players/leagues?leagueId=${leagueId}`);
        
        if (response.status === 401) {
          setIsAuthError(true);
          throw new Error('You must be logged in to view player analytics');
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch players');
        }
        
        const data = await response.json();
        if (data && data.players && data.players.length > 0) {
          setPlayers(data.players);
          // Auto-select the first player
          setSelectedPlayerId(data.players[0].id);
        } else {
          setPlayers([]);
          setError('No players found in this league');
        }
      } catch (error) {
        console.error('Error fetching players:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching players');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (leagueId) {
      fetchPlayers();
    }
  }, [leagueId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
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
      </div>
    );
  }

  if (isAuthError) {
    return (
      <Alert className="bg-amber-50">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex flex-col space-y-2">
          <span>You need to be signed in to view player analytics</span>
          <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col space-y-2">
          <span>{error}</span>
          <Button variant="outline" size="sm" className="w-fit" onClick={handleRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Players Found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This league doesn't have any players yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Select Player</label>
              <Select
                value={selectedPlayerId || undefined}
                onValueChange={(value) => setSelectedPlayerId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.nickname || player.name || 'Unnamed Player'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance Analysis</CardTitle>
                <CardDescription>
                  View detailed statistics for the selected player
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Analytics include:</p>
                <ul className="list-disc pl-4 space-y-1 mt-2">
                  <li>Win/loss record</li>
                  <li>Sets won percentage</li>
                  <li>Form and streak data</li>
                  <li>Comparison to league average</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {selectedPlayerId ? (
            <PlayerPerformanceCard playerId={selectedPlayerId} leagueId={leagueId} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a player to view their statistics</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}