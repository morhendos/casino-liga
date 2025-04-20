"use client";

import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  _id?: string;
  name: string;
  players: any[];
}

interface BulkGameGenerationFormProps {
  leagueId: string;
  teams: Team[];
  onGamesGenerated: () => void;
}

export default function BulkGameGenerationForm({
  leagueId,
  teams,
  onGamesGenerated
}: BulkGameGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate pairs of teams for round-robin
  const generateRoundRobinPairs = (teams: Team[]) => {
    const pairs: [Team, Team][] = [];
    
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        pairs.push([teams[i], teams[j]]);
      }
    }
    
    return pairs;
  };

  const handleGenerateGames = async () => {
    if (teams.length < 2) {
      toast.error("Need at least 2 teams to generate games");
      return;
    }

    try {
      setIsGenerating(true);
      
      const teamPairs = generateRoundRobinPairs(teams);
      const today = new Date();
      
      // Create all game pairs but don't assign dates yet
      const gamePromises = teamPairs.map(([teamA, teamB]) => {
        return fetch(`/api/matches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leagueId,
            teamAId: teamA.id || teamA._id,
            teamBId: teamB.id || teamB._id,
            scheduledDate: today, // Using today as default date
            scheduledTime: "", 
            location: ""
          }),
        });
      });
      
      const results = await Promise.allSettled(gamePromises);
      
      // Count successful and failed game creations
      let successCount = 0;
      let failCount = 0;
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.ok) {
          successCount++;
        } else {
          failCount++;
        }
      });
      
      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} games`);
        if (failCount > 0) {
          toast.warning(`Failed to generate ${failCount} games`);
        }
        onGamesGenerated();
      } else {
        toast.error("Failed to generate any games");
      }
      
    } catch (error) {
      console.error("Error generating games:", error);
      toast.error("Failed to generate games");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Game Generation</CardTitle>
        <CardDescription>
          Automatically create all game matchups in a round-robin format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            This will create {teams.length >= 2 ? (teams.length * (teams.length - 1)) / 2 : 0} games in total, one for each possible team matchup.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Note</h4>
                <p className="text-sm text-amber-700">
                  Games will be created with today's date by default. You'll need to edit each game manually to set the actual date and time.
                </p>
              </div>
            </div>
          </div>
          
          {teams.length < 2 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Not Enough Teams</h4>
                  <p className="text-sm text-red-700">
                    You need at least 2 teams to generate games.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateGames} 
          disabled={isGenerating || teams.length < 2}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Games...
            </>
          ) : (
            "Generate All Games"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
