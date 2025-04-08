"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { Team } from "@/hooks/useLeagueData";

interface TeamCardProps {
  team: Team;
  showActions?: boolean;
  onDelete?: (team: Team) => void;
  variant?: 'compact' | 'detailed';
}

export default function TeamCard({ 
  team, 
  showActions = true, 
  onDelete,
  variant = 'compact'
}: TeamCardProps) {
  
  // Format player names as a comma-separated string
  const playerNames = team.players.map(player => player.nickname).join(' & ');
  
  return (
    <Card className="p-4 hover:bg-muted/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{team.name}</h3>
          <p className="text-muted-foreground">{playerNames}</p>
          
          {variant === 'detailed' && team.players.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {team.players.map(player => (
                <span key={player.id} className="mr-2">
                  {player.nickname} (Level: {player.skillLevel})
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="ml-auto" size="sm">
            View
          </Button>
          
          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(team)}
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete team</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
