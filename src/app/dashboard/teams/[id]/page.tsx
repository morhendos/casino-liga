"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Users, Trophy, UserPlus, Pencil, Trash2 } from "lucide-react";

interface Player {
  id: string;
  _id?: string;
  nickname: string;
  skillLevel: number;
  handedness: string;
  preferredPosition: string;
  contactPhone?: string;
  bio?: string;
}

interface Team {
  id: string;
  _id?: string;
  name: string;
  players: Player[];
  logo?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const teamId = params.id as string;
  
  useEffect(() => {
    async function fetchTeam() {
      if (!teamId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/teams/${teamId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Team not found");
            router.push("/dashboard/teams");
            return;
          }
          
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch team");
        }
        
        const data = await response.json();
        console.log("Team data:", data);
        setTeam(data);
        
        // Check if current user is the team owner
        if (session?.user?.id && data.createdBy) {
          const ownerId = typeof data.createdBy === 'object' ? 
            data.createdBy.id || data.createdBy._id : 
            data.createdBy;
            
          setIsOwner(ownerId === session.user.id);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
        toast.error("Failed to load team details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeam();
  }, [teamId, session, router]);
  
  const handleDeleteTeam = async () => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete team");
      }
      
      toast.success("Team deleted successfully");
      router.push("/dashboard/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const getPlayerColor = (index: number) => {
    const colors = ["bg-primary/20 text-primary", "bg-secondary/20 text-secondary"];
    return colors[index % colors.length];
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">Loading team details...</div>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <div className="text-muted-foreground">Team not found or an error occurred.</div>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/teams">Back to Teams</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const players = team.players || [];
  const isComplete = players.length === 2;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation and header section - Fixed to put team name on its own line */}
      <div className="mb-8">
        <div className="mb-3">
          <Button variant="ghost" size="sm" className="px-0" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold">{team.name}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members
              </CardTitle>
              <CardDescription>
                {isComplete ? 
                  "Your team is complete and ready to join leagues!" : 
                  "Your team needs a partner to compete in leagues."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={player.id || player._id} className="flex items-center p-3 rounded-md border">
                    <div className={`w-10 h-10 rounded-full ${getPlayerColor(index)} flex items-center justify-center text-lg font-medium mr-3`}>
                      {player.nickname?.charAt(0) || "P"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-lg">{player.nickname}</div>
                      <div className="text-sm text-muted-foreground">
                        Skill Level: {player.skillLevel} • 
                        {player.handedness === "right" ? "Right-handed" : 
                         player.handedness === "left" ? "Left-handed" : "Ambidextrous"} • 
                        Position: {player.preferredPosition === "both" ? "Both" : 
                                  player.preferredPosition === "forehand" ? "Forehand" : "Backhand"}
                      </div>
                    </div>
                    {/* Add view player profile button if needed */}
                  </div>
                ))}
                
                {!isComplete && (
                  <div className="flex items-center p-3 rounded-md border border-dashed">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mr-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Find a partner</div>
                      <div className="text-sm text-muted-foreground">
                        You need a partner to compete in leagues
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/teams/find">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Find Partners
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {isComplete && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Leagues & Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">Ready to Compete</h3>
                  <p className="text-muted-foreground mb-4">
                    Your team is complete and ready to join leagues and tournaments!
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/leagues">
                      <Trophy className="h-4 w-4 mr-2" />
                      Browse Leagues
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/dashboard/teams/${teamId}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Team
                    </Link>
                  </Button>
                  
                  {!isComplete && (
                    <Button className="w-full justify-start" variant="outline" asChild>
                      <Link href={`/dashboard/teams/${teamId}/invite`}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Partner
                      </Link>
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="destructive" 
                    onClick={handleDeleteTeam}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Team"}
                  </Button>
                </>
              ) : (
                <div className="text-muted-foreground text-sm">
                  You are not the owner of this team. Only the team owner can manage the team.
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Team Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div>{new Date(team.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Team Status</div>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${team.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {team.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Skill Level</div>
                  <div>
                    {players.length > 0 ? 
                      (players.reduce((sum, player) => sum + player.skillLevel, 0) / players.length).toFixed(1) : 
                      "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(TeamDetailsPage);
