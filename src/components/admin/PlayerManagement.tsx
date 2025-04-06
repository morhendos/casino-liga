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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, Mail, User, UserCircle2 } from "lucide-react";

interface Player {
  id: string;
  _id: string;
  nickname: string;
  email?: string;
  userId?: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  status: 'invited' | 'active' | 'inactive';
  invitationSent: boolean;
  createdAt: string;
}

export function PlayerManagement() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // New player form state
  const [newPlayerData, setNewPlayerData] = useState({
    nickname: "",
    email: "",
    skillLevel: "5",
    handedness: "right",
    preferredPosition: "both"
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      let url = '/api/admin/players';
      
      // Add search params if provided
      const params = new URLSearchParams();
      
      if (searchTerm) {
        if (searchTerm.includes('@')) {
          params.append('email', searchTerm);
        } else {
          params.append('nickname', searchTerm);
        }
      }
      
      if (statusFilter && statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }
      
      const data = await response.json();
      
      if (data.players) {
        // Process the players to ensure IDs are normalized
        const processedPlayers = data.players.map((player: any) => ({
          ...player,
          id: player._id || player.id
        }));
        setPlayers(processedPlayers);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchPlayers();
  };
  
  const handleCreatePlayer = async () => {
    try {
      setIsCreating(true);
      
      // Validate email if provided
      if (newPlayerData.email && !(/^\S+@\S+\.\S+$/.test(newPlayerData.email))) {
        toast.error("Please enter a valid email address");
        return;
      }
      
      // Validate required fields
      if (!newPlayerData.nickname) {
        toast.error("Player nickname is required");
        return;
      }
      
      const response = await fetch('/api/admin/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPlayerData,
          skillLevel: parseInt(newPlayerData.skillLevel)
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create player');
      }
      
      const newPlayer = await response.json();
      
      // Update the players list
      setPlayers([newPlayer, ...players]);
      
      // Reset the form
      setNewPlayerData({
        nickname: "",
        email: "",
        skillLevel: "5",
        handedness: "right",
        preferredPosition: "both"
      });
      
      // Close dialog
      setCreateDialogOpen(false);
      
      toast.success("Player created successfully");
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create player');
    } finally {
      setIsCreating(false);
    }
  };
  
  const sendInvitation = async (playerId: string) => {
    try {
      const response = await fetch(`/api/admin/players/${playerId}/invite`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }
      
      // Update the player in the list
      setPlayers(players.map(player => {
        if (player.id === playerId) {
          return { ...player, invitationSent: true };
        }
        return player;
      }));
      
      toast.success("Invitation sent successfully");
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    }
  };
  
  const getStatusBadge = (player: Player) => {
    if (player.userId) {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Active User</Badge>;
    }
    
    if (player.status === 'invited') {
      return player.invitationSent ? 
        <Badge variant="outline" className="bg-blue-50 text-blue-700">Invitation Sent</Badge> :
        <Badge variant="outline" className="bg-amber-50 text-amber-700">Pending Invitation</Badge>;
    }
    
    return <Badge variant="outline" className="bg-gray-100 text-gray-700">{player.status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="Search by nickname or email"
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
              <SelectItem value="all">All Players</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Player
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Player</DialogTitle>
                <DialogDescription>
                  Create a player profile. You can invite them to register later.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nickname">Nickname *</Label>
                  <Input
                    id="nickname"
                    placeholder="Player's nickname"
                    value={newPlayerData.nickname}
                    onChange={(e) => setNewPlayerData({...newPlayerData, nickname: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="player@example.com"
                    value={newPlayerData.email}
                    onChange={(e) => setNewPlayerData({...newPlayerData, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select
                      value={newPlayerData.skillLevel}
                      onValueChange={(value) => setNewPlayerData({...newPlayerData, skillLevel: value})}
                    >
                      <SelectTrigger id="skillLevel">
                        <SelectValue placeholder="Skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="handedness">Handedness</Label>
                    <Select
                      value={newPlayerData.handedness}
                      onValueChange={(value) => setNewPlayerData({...newPlayerData, handedness: value})}
                    >
                      <SelectTrigger id="handedness">
                        <SelectValue placeholder="Hand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="ambidextrous">Ambi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newPlayerData.preferredPosition}
                      onValueChange={(value) => setNewPlayerData({...newPlayerData, preferredPosition: value})}
                    >
                      <SelectTrigger id="position">
                        <SelectValue placeholder="Position" />
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
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePlayer} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Player"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nickname</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skill Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="py-8 text-muted-foreground animate-pulse">
                        Loading players...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : players.length > 0 ? (
                  players.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.nickname}</TableCell>
                      <TableCell>{player.email || "N/A"}</TableCell>
                      <TableCell>{player.skillLevel}</TableCell>
                      <TableCell>{getStatusBadge(player)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {player.email && !player.userId && !player.invitationSent && (
                            <Button variant="outline" size="sm" onClick={() => sendInvitation(player.id)}>
                              <Mail className="h-4 w-4 mr-1" />
                              Invite
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <a href={`/dashboard/admin/players/${player.id}`}>
                              <UserCircle2 className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="py-8">
                        <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No players found</p>
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