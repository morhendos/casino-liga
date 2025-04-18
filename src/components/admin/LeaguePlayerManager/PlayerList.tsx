"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  Users,
  Mail,
  PlusCircle,
  Dumbbell,
  HandMetal,
  Trash2,
} from "lucide-react";
import { Player } from "@/hooks/useLeagueData";

interface PlayerListProps {
  availablePlayers: Player[];
  isLoading: boolean;
  selectedPlayers: Player[];
  playersInTeams: Set<string>;
  onAddPlayer: (player: Player) => void;
  onCreatePlayer: (playerData: any) => Promise<Player | null>;
  onDeletePlayer?: (playerId: string) => Promise<boolean>;
  isCreatingPlayer: boolean;
}

// Search icon component
function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// Get player skill level badge with color corresponding to skill level
const SkillLevelBadge = ({ level }: { level: number }) => {
  let bgColor, textColor;
  
  if (level >= 8) {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (level >= 6) {
    bgColor = "bg-blue-100"; 
    textColor = "text-blue-800";
  } else if (level >= 4) {
    bgColor = "bg-amber-100";
    textColor = "text-amber-800";
  } else {
    bgColor = "bg-gray-100";
    textColor = "text-gray-800";
  }
  
  return (
    <div className={`flex items-center gap-1 ${textColor}`}>
      <Dumbbell className="h-3.5 w-3.5" />
      <span className={`inline-flex items-center justify-center rounded-md w-6 h-6 text-xs font-semibold ${bgColor} ${textColor}`}>
        {level}
      </span>
    </div>
  );
};

const handednessLabels: Record<string, string> = {
  'right': 'Right-handed',
  'left': 'Left-handed',
  'ambidextrous': 'Ambidextrous'
};

const positionLabels: Record<string, string> = {
  'forehand': 'Forehand',
  'backhand': 'Backhand',
  'both': 'Both positions'
};

export default function PlayerList({
  availablePlayers,
  isLoading,
  selectedPlayers,
  playersInTeams,
  onAddPlayer,
  onCreatePlayer,
  onDeletePlayer,
  isCreatingPlayer,
}: PlayerListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [showNewPlayerDialog, setShowNewPlayerDialog] = useState(false);
  
  // New player form state
  const [newPlayerNickname, setNewPlayerNickname] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [newPlayerSkillLevel, setNewPlayerSkillLevel] = useState("5");
  const [newPlayerHandedness, setNewPlayerHandedness] = useState("right");
  const [newPlayerPosition, setNewPlayerPosition] = useState("both");

  // Update filtered players based on search and selected players
  useEffect(() => {
    // Start with all players
    let playerPool = [...availablePlayers];

    // Remove players that are already selected
    playerPool = playerPool.filter(
      (player) => !selectedPlayers.some((p) => p.id === player.id)
    );

    // Remove players that are already in teams
    playerPool = playerPool.filter((player) => !playersInTeams.has(player.id));

    // Then apply search filter if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      playerPool = playerPool.filter(
        (player) =>
          player.nickname.toLowerCase().includes(query) ||
          player.email?.toLowerCase().includes(query)
      );
    }

    setFilteredPlayers(playerPool);
  }, [searchQuery, availablePlayers, selectedPlayers, playersInTeams]);

  const resetNewPlayerForm = () => {
    setNewPlayerNickname("");
    setNewPlayerEmail("");
    setNewPlayerSkillLevel("5");
    setNewPlayerHandedness("right");
    setNewPlayerPosition("both");
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerNickname.trim()) return;

    const playerData = {
      nickname: newPlayerNickname,
      skillLevel: parseInt(newPlayerSkillLevel, 10),
      handedness: newPlayerHandedness,
      preferredPosition: newPlayerPosition,
      email: newPlayerEmail.trim() || undefined,
    };

    const newPlayer = await onCreatePlayer(playerData);
    
    if (newPlayer) {
      resetNewPlayerForm();
      setShowNewPlayerDialog(false);
    }
  };
  
  const handleDeletePlayer = async (playerId: string, e: React.MouseEvent) => {
    // Stop event propagation to prevent adding the player
    e.stopPropagation();
    
    if (!onDeletePlayer) return;
    
    const success = await onDeletePlayer(playerId);
    if (success) {
      toast.success("Player deleted successfully");
    }
  };

  return (
    <Card className="h-full overflow-hidden border-2 border-muted">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            <span className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Available Players
            </span>
          </CardTitle>
          <Dialog
            open={showNewPlayerDialog}
            onOpenChange={setShowNewPlayerDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Player</DialogTitle>
                <DialogDescription>
                  Add a new player to the system. Players with email
                  addresses can be invited later.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nickname">Nickname *</Label>
                  <Input
                    id="nickname"
                    value={newPlayerNickname}
                    onChange={(e) => setNewPlayerNickname(e.target.value)}
                    placeholder="Player nickname"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPlayerEmail}
                    onChange={(e) => setNewPlayerEmail(e.target.value)}
                    placeholder="player@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    If provided, the player can be invited to join the
                    platform later
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select
                      value={newPlayerSkillLevel}
                      onValueChange={setNewPlayerSkillLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <SelectItem
                            key={level}
                            value={level.toString()}
                          >
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="handedness">Handedness</Label>
                    <Select
                      value={newPlayerHandedness}
                      onValueChange={setNewPlayerHandedness}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select handedness" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="ambidextrous">
                          Ambidextrous
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newPlayerPosition}
                      onValueChange={setNewPlayerPosition}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forehand">Forehand</SelectItem>
                        <SelectItem value="backhand">Backhand</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPlayerDialog(false)}
                  disabled={isCreatingPlayer}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePlayer}
                  disabled={!newPlayerNickname.trim() || isCreatingPlayer}
                >
                  {isCreatingPlayer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Player"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mt-4">
          <Input
            placeholder="Search players by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredPlayers.length > 0 ? (
            <div className="divide-y">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="relative p-4 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => onAddPlayer(player)}
                >
                  <div className="flex items-start gap-3">
                    {/* Player Details */}
                    <div className="flex-1">
                      <div className="font-medium text-lg">{player.nickname}</div>
                      
                      <div className="flex flex-wrap gap-4 mt-1">
                        <SkillLevelBadge level={player.skillLevel} />
                        
                        {player.handedness && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <HandMetal className="h-3.5 w-3.5" />
                            <span>{handednessLabels[player.handedness]}</span>
                          </div>
                        )}
                        
                        {player.preferredPosition && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{positionLabels[player.preferredPosition]}</span>
                          </div>
                        )}
                      </div>
                      
                      {player.email && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{player.email}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons (visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      {onDeletePlayer && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full p-0 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                          onClick={(e) => handleDeletePlayer(player.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete player</span>
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full p-0 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                      >
                        <PlusCircle className="h-5 w-5" />
                        <span className="sr-only">Add player</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="font-medium">No available players</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try another search term or create a new player"
                  : "All players are already in teams or selected"}
              </p>
              <Button
                onClick={() => setShowNewPlayerDialog(true)}
                variant="outline"
                className="mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Player
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Add toast import
import { toast } from "sonner";
