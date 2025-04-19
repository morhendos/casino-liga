import { Metadata } from 'next';
import { LeagueStatsDashboard, PlayerPerformanceCard, AdminReportsPanel } from '@/components/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Activity, Users, FileText, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'League Analytics',
  description: 'View detailed statistics and analytics for this league',
};

export default async function LeagueAnalyticsPage({ params }: { params: { id: string } }) {
  const leagueId = params.id;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href={`/dashboard/leagues/${leagueId}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to League
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">League Analytics</h1>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="players">
            <Users className="h-4 w-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>League Statistics</CardTitle>
              <CardDescription>
                Overview of match results, participation, and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeagueStatsDashboard leagueId={leagueId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Analytics</CardTitle>
              <CardDescription>
                Individual player performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Select a player to view their performance metrics for this league.
                This section will be expanded to show all players in the league with search and filtering.
              </p>
              
              {/* Just show a message about future implementation */}
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">
                  Player analytics will be available in a future update.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature will allow you to view detailed statistics for each player in the league.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>League Reports</CardTitle>
              <CardDescription>
                Generate and download reports for various league data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReportsPanel leagueId={leagueId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
