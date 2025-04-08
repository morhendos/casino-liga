'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface PlayerItem {
  id: string;
  nickname: string;
  email?: string;
  status?: string;
  invitationSent?: boolean;
}

interface PlayerInvitationManagementProps {
  players: PlayerItem[];
  onInviteSent?: (player: PlayerItem) => void;
  onCreatePlayer?: (player: { nickname: string; email: string }) => Promise<PlayerItem>;
}

export default function PlayerInvitationManagement({ 
  players, 
  onInviteSent,
  onCreatePlayer
}: PlayerInvitationManagementProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  // For creating new players
  const [isCreating, setIsCreating] = useState(false);
  const [newPlayerNickname, setNewPlayerNickname] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  // Filter players by invitation status
  const invitablePlayers = players.filter(p => p.email && !p.invitationSent && p.status !== 'active');
  const invitedPlayers = players.filter(p => p.invitationSent || p.status === 'invited');
  const activePlayers = players.filter(p => p.status === 'active');

  const sendInvitation = async (player: PlayerItem) => {
    if (!player.email) {
      toast({
        title: 'Error',
        description: 'Player has no email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setPlayerId(player.id);

      const response = await fetch(`/api/admin/players/${player.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send invitation');
      }

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${player.email}`,
      });

      if (onInviteSent) {
        onInviteSent(player);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setPlayerId(null);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerNickname || !newPlayerEmail) {
      toast({
        title: 'Error',
        description: 'Player nickname and email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      
      if (!onCreatePlayer) {
        throw new Error('Player creation function not provided');
      }

      const newPlayer = await onCreatePlayer({
        nickname: newPlayerNickname,
        email: newPlayerEmail
      });

      toast({
        title: 'Player Created',
        description: `${newPlayerNickname} has been created successfully`,
      });

      // Reset form
      setNewPlayerNickname('');
      setNewPlayerEmail('');
      setIsCreating(false);
      
      // Send invitation to the newly created player
      await sendInvitation(newPlayer);

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create player',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="Player nickname"
                value={newPlayerNickname}
                onChange={(e) => setNewPlayerNickname(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="player@example.com"
                value={newPlayerEmail}
                onChange={(e) => setNewPlayerEmail(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreatePlayer} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create & Invite Player'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Players awaiting invitation */}
      {invitablePlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Players to Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitablePlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{player.nickname}</h3>
                    <p className="text-sm text-gray-500">{player.email}</p>
                  </div>
                  <Button
                    onClick={() => sendInvitation(player)}
                    disabled={isLoading && playerId === player.id}
                    size="sm"
                  >
                    {isLoading && playerId === player.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invited players */}
      {invitedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invited Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitedPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{player.nickname}</h3>
                    <p className="text-sm text-gray-500">{player.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                    Invited
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active players */}
      {activePlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activePlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{player.nickname}</h3>
                    <p className="text-sm text-gray-500">{player.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
