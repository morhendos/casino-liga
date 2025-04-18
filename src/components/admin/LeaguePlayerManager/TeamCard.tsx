"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash } from "lucide-react";
import { Team } from "@/hooks/useLeagueData";
import { useEffect, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Format player names as a comma-separated string
  const playerNames = team.players.map(player => player.nickname).join(' & ');
  
  // Animate entry when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Small delay for the animation to work
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    
    // Animate removal before actually calling onDelete
    setIsRemoving(true);
    
    // Wait for animation to complete before calling delete
    setTimeout(() => {
      onDelete(team);
    }, 300);
  };
  
  return (
    <Card 
      className={`p-4 hover:bg-muted/10 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      } ${
        isRemoving ? 'opacity-0 transform -translate-x-4' : ''
      }`}
    >
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
              onClick={handleDelete}
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
