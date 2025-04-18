"use client";

import { Card } from "@/components/ui/card";
import { Team } from "@/hooks/useLeagueData";
import { TeamCard } from "@/components/admin/LeaguePlayerManager"; 

interface TeamsListSectionProps {
  teams: Team[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
  showActions?: boolean;
}

export default function TeamsListSection({ 
  teams, 
  title = "Teams", 
  subtitle,
  loading = false,
  showActions = false
}: TeamsListSectionProps) {
  
  // Generate default subtitle if one isn't provided
  const defaultSubtitle = subtitle || `${teams.length} of ${teams.length} teams registered`;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {defaultSubtitle && <p className="text-muted-foreground">{defaultSubtitle}</p>}
      </div>
      
      <div className="space-y-2">
        {teams.map(team => (
          <TeamCard 
            key={team.id} 
            team={team} 
            showActions={showActions}
            variant="compact"
          />
        ))}
        
        {teams.length === 0 && !loading && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No teams have been registered yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
