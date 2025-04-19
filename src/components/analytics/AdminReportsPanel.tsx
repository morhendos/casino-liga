'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Users, Trophy, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AdminReportsPanelProps {
  leagueId: string;
}

export default function AdminReportsPanel({ leagueId }: AdminReportsPanelProps) {
  const [selectedReport, setSelectedReport] = useState('schedule');
  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState('csv');
  
  const handleGenerateReport = async () => {
    // Only allow CSV format for now
    if (format !== 'csv') {
      return;
    }
    
    setIsGenerating(true);
    try {
      // API endpoint to generate and download the report
      const response = await fetch(`/api/leagues/${leagueId}/reports/${selectedReport}?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      // Get the filename from the Content-Disposition header if available
      let filename = `${selectedReport}-report.${format}`;
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      // Handle error (could show a toast notification here)
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>League Reports</CardTitle>
        <CardDescription>
          Generate and download reports for league data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule" onValueChange={setSelectedReport}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="teams">
              <Users className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="standings">
              <Trophy className="h-4 w-4 mr-2" />
              Standings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Schedule Report</h3>
              <p className="text-sm text-muted-foreground">
                Export the complete match schedule, including dates, times, venues, and teams.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="teams" className="pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Teams Report</h3>
              <p className="text-sm text-muted-foreground">
                Export team information including player details, contact information, and participation statistics.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="standings" className="pt-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Standings Report</h3>
              <p className="text-sm text-muted-foreground">
                Export current league standings with detailed scoring information, win/loss records, and points.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Export Options</h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Format</label>
              <Select defaultValue="csv" onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx" disabled>
                    Excel (XLSX) <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                  </SelectItem>
                  <SelectItem value="pdf" disabled>
                    PDF <Badge variant="outline" className="ml-2 text-xs">Coming Soon</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Currently, only CSV export format is available. Excel and PDF exports will be added in a future update.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isGenerating || format !== 'csv'}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <FileText className="mr-2 h-4 w-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}