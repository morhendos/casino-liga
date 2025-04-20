# League Analytics Features

This document outlines the analytics and reporting features implemented in the Padeliga application to provide insights into league performance, player statistics, and administrative reporting capabilities.

## 1. League Statistics Dashboard

The League Statistics Dashboard provides comprehensive analytics about league performance and progress.

### Features

- **Completion Status**: Shows percentage of completed matches with a progress indicator
- **Player Participation**: Displays active player rate and participation statistics
- **Match Statistics**: Includes average sets per match and most common scores
- **League Activity**: Shows recent match frequency and days remaining
- **Match Outcomes**: Provides breakdown of decisive, close, and tiebreak matches
- **Sets Distribution**: Shows percentage of matches completed in 2 vs 3 sets
- **Team Rankings**: Displays top performing teams with win rates

### Implementation

- Located in `/src/components/analytics/LeagueStatsDashboard.tsx`
- API endpoint at `/api/leagues/[id]/stats`
- Fully responsive design with skeleton loading states
- Tabbed interface for overview, matches, and team-specific data
- Uses React's useEffect and useState for data fetching and management
- Custom Progress component for visualizing percentage metrics

## 2. Player Performance Metrics

The Player Performance Card shows detailed statistics for individual players.

### Features

- **Win/Loss Record**: Overall matches won and lost
- **Win Rate**: Percentage of matches won with comparison to league average
- **Sets Won**: Percentage and count of individual sets won
- **Form Statistics**: Last 5 matches, current streak, and best score
- **Performance Trends**: Indicators showing improvement or decline

### Implementation

- Located in `/src/components/analytics/PlayerPerformanceCard.tsx`
- API endpoint at `/api/players/[id]/stats`
- Optional league-specific filtering via query parameters
- Error handling and loading states with Skeleton placeholder components
- Visual indicators (up/down arrows) for performance trends
- Supports both league-specific and overall player stats

## 3. Admin Reports Panel

The Admin Reports Panel allows administrators to generate and download various reports.

### Report Types

- **Schedule Report**: Complete match schedule with dates, times, venues, and teams
- **Teams Report**: Team information including player details and participation statistics
- **Standings Report**: Current league standings with detailed scoring information

### Export Options

- **CSV**: Comma-separated values format for spreadsheet import
- **XLSX**: Excel format (planned but not fully implemented)
- **PDF**: PDF format (planned but not fully implemented)

### Implementation

- Located in `/src/components/analytics/AdminReportsPanel.tsx`
- API endpoint at `/api/leagues/[id]/reports/[type]`
- Admin role checking for security
- Downloadable files with proper headers
- Server-side data processing for efficient report generation
- Custom CSV generation with proper escaping for values containing commas

## 4. Analytics Integration

The analytics features are integrated into the main application through a dedicated analytics page for each league.

### Integration Points

- **League Analytics Page**: `/dashboard/leagues/[id]/analytics`
- **Navigation**: Added to the league details page in two places:
  - Main "Analytics" button in the header next to "Manage League"
  - "Analytics & Reports" quick link in the right sidebar
- **User Access**: Read-only for regular users, full access for admins

### Technical Implementation

- Consistent data fetching pattern using useEffect hooks
- Database access via `withConnection()` pattern for all database operations
- Type safety through TypeScript interfaces
- Error boundary components for graceful error handling
- Loading states for better UX during data fetching
- Role-based access controls for admin-only features

## How to Access Analytics

1. **From League Details Page**:
   - Navigate to any league details page
   - Click the "Analytics" button in the top right next to "Manage League"
   - Alternatively, use the "Analytics & Reports" link in the sidebar Quick Links section

2. **Direct URL Access**:
   - Access any league's analytics directly via `/dashboard/leagues/{leagueId}/analytics`
   - Replace `{leagueId}` with the specific league ID

## Future Enhancements

1. **Enhanced Visualizations**:
   - Implement interactive charts and graphs for data visualization
   - Add historical trend analysis

2. **Advanced Filters**:
   - Time-based filtering (by week, month, season)
   - Performance breakdown by venue or time slot

3. **Player Comparisons**:
   - Side-by-side comparison of player performance
   - Team chemistry analysis

4. **Predictive Analytics**:
   - Match outcome predictions based on historical data
   - Player improvement projections

5. **Export Enhancements**:
   - Complete the implementation of XLSX and PDF exports
   - Add email delivery of reports

## Usage Instructions

1. **Viewing Analytics**:
   - Navigate to a league's detail page
   - Click on the "Analytics" tab or button
   - Explore the various tabs for different analytics views

2. **Generating Reports**:
   - Go to the "Reports" tab in the analytics view
   - Select the report type and format
   - Click "Generate Report" to download

3. **Viewing Player Performance**:
   - Navigate to the "Players" tab in the analytics view
   - Select a player to view their detailed statistics

## Implementation Notes

- All analytics calculations are performed server-side for better performance
- Data is cached where appropriate to reduce database load
- Role-based access control enforces admin-only access to sensitive reports
- All components include loading and error states for better user experience
- Custom database queries optimize for performance with complex statistics calculations
- MongoDB aggregation pipeline is used for efficient data processing
- Frontend components are designed to be responsive and mobile-friendly
