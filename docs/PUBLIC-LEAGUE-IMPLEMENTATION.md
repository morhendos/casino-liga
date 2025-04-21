# Padeliga Public League View - Implementation Plan

## Overview
This document outlines the implementation plan for adding public-facing league pages to Padeliga. These pages will display league rankings, match results, and upcoming games without requiring users to log in.

## Implementation Checklist

### 1. Create Public API Routes
- [x] Create `/src/app/api/public/leagues/[id]/route.ts`
  ```typescript
  // Get league details (name, description, dates, etc.)
  export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    
    try {
      const league = await LeagueModel.findById(params.id)
        .select('name description startDate endDate venue status banner')
        .lean();
      
      if (!league) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      
      return NextResponse.json(league);
    } catch (error) {
      console.error('Error fetching league:', error);
      return NextResponse.json(
        { error: 'Failed to fetch league data' },
        { status: 500 }
      );
    }
  }
  ```

- [x] Create `/src/app/api/public/leagues/[id]/rankings/route.ts`
  ```typescript
  // Get league rankings
  export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    
    try {
      const rankings = await RankingModel.find({ league: params.id })
        .populate('team', 'name')
        .sort({ points: -1, matchesWon: -1 })
        .lean();
      
      return NextResponse.json(rankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rankings data' },
        { status: 500 }
      );
    }
  }
  ```

- [x] Create `/src/app/api/public/leagues/[id]/matches/route.ts`
  ```typescript
  // Get league matches
  export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    await connectToDatabase();
    
    try {
      const matches = await MatchModel.find({ league: params.id })
        .populate('teamA teamB', 'name')
        .sort({ scheduledDate: 1 })
        .lean();
      
      return NextResponse.json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json(
        { error: 'Failed to fetch matches data' },
        { status: 500 }
      );
    }
  }
  ```

### 2. Create Data Fetching Library Functions

- [x] Create/update `/src/lib/db/leagues.ts` with public fetching function
  ```typescript
  export async function getLeagueById(id: string) {
    await connectToDatabase();
    
    const league = await LeagueModel.findById(id)
      .select('name description startDate endDate venue status banner')
      .lean();
      
    return league;
  }
  ```

- [x] Create/update `/src/lib/db/rankings.ts` with public fetching function
  ```typescript
  export async function getLeagueRankings(leagueId: string) {
    await connectToDatabase();
    
    const rankings = await RankingModel.find({ league: leagueId })
      .populate('team', 'name')
      .sort({ points: -1, matchesWon: -1 })
      .lean();
      
    return rankings;
  }
  ```

- [x] Create/update `/src/lib/db/matches.ts` with public fetching function
  ```typescript
  export async function getLeagueMatches(leagueId: string) {
    await connectToDatabase();
    
    const matches = await MatchModel.find({ league: leagueId })
      .populate('teamA teamB', 'name')
      .sort({ scheduledDate: 1 })
      .lean();
      
    return matches;
  }
  ```

### 3. Create Public UI Components

- [x] Create `/src/components/public/LeagueHeader.tsx`
  ```tsx
  import { formatDate } from '@/utils/date';
  
  export default function LeagueHeader({ league }) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold">{league.name}</h1>
        {league.banner && (
          <div className="mt-4 h-48 overflow-hidden rounded-lg">
            <img 
              src={league.banner} 
              alt={`${league.name} banner`} 
              className="w-full object-cover"
            />
          </div>
        )}
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-300">{league.description}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {league.startDate && (
              <div>
                <span className="font-semibold">Start:</span> {formatDate(league.startDate)}
              </div>
            )}
            {league.endDate && (
              <div>
                <span className="font-semibold">End:</span> {formatDate(league.endDate)}
              </div>
            )}
            {league.venue && (
              <div>
                <span className="font-semibold">Venue:</span> {league.venue}
              </div>
            )}
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className="capitalize">{league.status}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [x] Create `/src/components/public/RankingsTable.tsx`
  ```tsx
  export default function RankingsTable({ rankings }) {
    if (!rankings || rankings.length === 0) {
      return (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p>No rankings available yet.</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">W</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">L</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {rankings.map((ranking, index) => (
              <tr key={ranking._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.team?.name || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.matchesPlayed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.matchesWon}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.matchesLost}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ranking.setsWon}-{ranking.setsLost}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{ranking.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  ```

- [x] Create `/src/components/public/MatchResults.tsx`
  ```tsx
  import { formatDate } from '@/utils/date';
  
  export default function MatchResults({ matches }) {
    // Sort matches by date, most recent first
    const sortedMatches = [...matches].sort((a, b) => {
      return new Date(b.scheduledDate || b.createdAt).getTime() - 
             new Date(a.scheduledDate || a.createdAt).getTime();
    });
    
    if (!sortedMatches || sortedMatches.length === 0) {
      return (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p>No match results available yet.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sortedMatches.map(match => (
          <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {match.scheduledDate ? formatDate(match.scheduledDate) : 'Date not set'}
              </div>
              {match.location && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {match.location}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="font-medium">{match.teamA?.name || 'Team A'}</div>
              <div className="text-center font-bold">
                {match.result ? (
                  <div>{match.result.teamAScore.join('-')} : {match.result.teamBScore.join('-')}</div>
                ) : (
                  <div>vs</div>
                )}
              </div>
              <div className="font-medium text-right">{match.teamB?.name || 'Team B'}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  ```

- [x] Create `/src/components/public/UpcomingMatches.tsx`
  ```tsx
  import { formatDate } from '@/utils/date';
  
  export default function UpcomingMatches({ matches }) {
    // Sort matches by date
    const sortedMatches = [...matches].sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : Infinity;
      const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : Infinity;
      return dateA - dateB;
    });
    
    if (!sortedMatches || sortedMatches.length === 0) {
      return (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p>No upcoming matches scheduled.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {sortedMatches.map(match => (
          <div key={match._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {match.scheduledDate 
                  ? `${formatDate(match.scheduledDate)}${match.scheduledTime ? ` at ${match.scheduledTime}` : ''}` 
                  : 'Date TBD'}
              </div>
              {match.location && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {match.location}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="font-medium">{match.teamA?.name || 'Team A'}</div>
              <div className="text-center">vs</div>
              <div className="font-medium text-right">{match.teamB?.name || 'Team B'}</div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {match.status === 'unscheduled' ? 'Not yet scheduled' : match.status}
            </div>
          </div>
        ))}
      </div>
    );
  }
  ```

### 4. Create Public League Page

- [x] Create `/src/app/(public)/leagues/[id]/page.tsx`
  ```tsx
  import { Metadata } from 'next';
  import { notFound } from 'next/navigation';
  import { getLeagueById } from '@/lib/db/leagues';
  import { getLeagueRankings } from '@/lib/db/rankings';
  import { getLeagueMatches } from '@/lib/db/matches';
  import LeagueHeader from '@/components/public/LeagueHeader';
  import RankingsTable from '@/components/public/RankingsTable';
  import MatchResults from '@/components/public/MatchResults';
  import UpcomingMatches from '@/components/public/UpcomingMatches';
  
  // Generate metadata for SEO
  export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const league = await getLeagueById(params.id);
    
    if (!league) {
      return {
        title: 'League Not Found - Padeliga',
      };
    }
    
    return {
      title: `${league.name} - Padeliga`,
      description: league.description || `View rankings and matches for ${league.name} padel league`,
    };
  }
  
  export default async function PublicLeaguePage({ params }: { params: { id: string } }) {
    const league = await getLeagueById(params.id);
    
    if (!league) {
      notFound();
    }
    
    const rankings = await getLeagueRankings(params.id);
    const matches = await getLeagueMatches(params.id);
    
    // Split matches into completed and upcoming
    const completedMatches = matches.filter(match => match.status === 'completed');
    const upcomingMatches = matches.filter(match => 
      ['scheduled', 'unscheduled'].includes(match.status)
    );
    
    return (
      <div className="container mx-auto px-4 py-8">
        <LeagueHeader league={league} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Current Rankings</h2>
            <RankingsTable rankings={rankings} />
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Upcoming Matches</h2>
            <UpcomingMatches matches={upcomingMatches} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
            <MatchResults matches={completedMatches} />
          </div>
        </div>
      </div>
    );
  }
  ```

### 5. Create Public Layout (Optional)

- [x] Create `/src/app/(public)/layout.tsx` for public pages layout
  ```tsx
  import Link from 'next/link';
  import { Toaster } from '@/components/ui/toaster';
  
  export default function PublicLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Padeliga
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-primary text-white rounded-md px-3 py-2 hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Padeliga. Tu liga. Tu juego.
            </p>
          </div>
        </footer>
        <Toaster />
      </div>
    );
  }
  ```

### 6. Create Public Leagues Directory (Optional)

- [x] Create `/src/app/(public)/leagues/page.tsx` for listing public leagues
  ```tsx
  import Link from 'next/link';
  import { getPublicLeagues } from '@/lib/db/leagues';
  
  export const metadata = {
    title: 'Browse Leagues - Padeliga',
    description: 'Browse and discover padel leagues on Padeliga',
  };
  
  export default async function LeaguesDirectoryPage() {
    const leagues = await getPublicLeagues();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Leagues</h1>
        
        {leagues.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No leagues found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map(league => (
              <Link 
                key={league._id} 
                href={`/leagues/${league._id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                {league.banner && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={league.banner} 
                      alt={league.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{league.name}</h2>
                  {league.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">
                      {league.description}
                    </p>
                  )}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {league.status}
                    </span>
                    {league.startDate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Starts: {new Date(league.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  ```

### 7. Update Middleware for Authentication Bypass

- [x] Update `/src/middleware.ts` to allow public routes
  ```typescript
  export const config = {
    matcher: [
      // Added exclusions for public league pages
      '/((?!api/public|_next/static|_next/image|favicon.ico|leagues/[^/]+$).*)',
    ],
  };
  ```

### 8. Add League Visibility Controls

- [x] Update League model in `/src/models/league.ts`
  ```typescript
  // Add to the schema
  isPublic: {
    type: Boolean,
    default: true,
  },
  ```

- [x] Update League form component to include visibility toggle
  ```tsx
  <div className="flex items-center space-x-2">
    <Checkbox 
      id="isPublic" 
      {...register('isPublic')} 
      defaultChecked={defaultValues?.isPublic ?? true}
    />
    <Label htmlFor="isPublic">
      Make this league publicly viewable
    </Label>
  </div>
  ```

### 9. Add Sharing Feature to Dashboard

- [x] Add sharing component to league dashboard
  ```tsx
  // src/components/leagues/ShareLeagueButton.tsx
  import { Button } from '@/components/ui/button';
  import { LinkIcon } from 'lucide-react';
  import { useToast } from '@/components/ui/toast';
  
  export default function ShareLeagueButton({ leagueId }: { leagueId: string }) {
    const { toast } = useToast();
    const leagueUrl = `${window.location.origin}/leagues/${leagueId}`;
    
    const copyToClipboard = () => {
      navigator.clipboard.writeText(leagueUrl);
      toast({
        title: 'Link copied!',
        description: 'League link has been copied to clipboard',
      });
    };
    
    return (
      <Button 
        variant="outline" 
        onClick={copyToClipboard}
        className="flex items-center gap-2"
      >
        <LinkIcon size={16} />
        Share League
      </Button>
    );
  }
  ```

- [x] Add button to league dashboard
  ```tsx
  // Add this to your league dashboard header
  <div className="flex items-center space-x-2">
    <OtherButtons />
    <ShareLeagueButton leagueId={league._id} />
  </div>
  ```

### 10. Testing

- [x] Test each API endpoint
  - [x] Public league details
  - [x] Public rankings
  - [x] Public matches

- [x] Test public league page rendering
  - [x] League with matches and rankings
  - [x] League with no matches
  - [x] League with no rankings
  - [x] Non-existent league (should 404)

- [x] Test middleware bypass
  - [x] Public league should be accessible without login
  - [x] Public leagues directory should be accessible without login
  - [x] Dashboard routes should still require login

- [x] Test sharing functionality
  - [x] Copy to clipboard works
  - [x] Shared link resolves to correct league