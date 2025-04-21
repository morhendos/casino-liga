# Public League Feature

## Overview

The Public League feature allows leagues to be accessed by non-authenticated users. This provides greater visibility for leagues and makes it easier for participants and spectators to check rankings, match results, and upcoming games without requiring a login.

## User Stories

1. As a league organizer, I want to make my league publicly accessible so that players can easily share and view league information.
2. As a player, I want to share my league standings with friends and family without requiring them to create an account.
3. As a spectator, I want to browse active leagues and view their match results without logging in.

## Features

### Public League Pages

- **Public League View**: A dedicated page for each public league that displays:
  - League information (name, description, dates, venue)
  - Current rankings
  - Recent match results
  - Upcoming matches

- **Leagues Directory**: A page that lists all public leagues, allowing users to discover active leagues.

### Admin Controls

- **Visibility Toggle**: League admins can control whether their league is public or private.
- **Share Button**: Easy sharing of league links from the admin dashboard.

## Technical Implementation

### Data Model Changes

The `League` model has been extended with an `isPublic` field:

```typescript
isPublic: {
  type: Boolean,
  default: true,
  description: "Controls whether the league is visible to non-authenticated users"
}
```

### Authentication Bypass

The middleware has been updated to bypass authentication for the following routes:
- `/leagues/*` - Public league pages
- `/api/public/*` - Public API endpoints

### API Endpoints

- `/api/public/leagues` - List all public leagues
- `/api/public/leagues/[id]` - Get details for a specific league
- `/api/public/leagues/[id]/rankings` - Get rankings for a specific league
- `/api/public/leagues/[id]/matches` - Get matches for a specific league

### UI Components

The following components have been created for the public league view:
- `LeagueHeader` - Displays league information
- `RankingsTable` - Displays current rankings
- `MatchResults` - Displays completed matches
- `UpcomingMatches` - Displays upcoming matches
- `ShareLeagueButton` - For copying league URL to clipboard

## Routes

- `/leagues` - Directory of all public leagues
- `/leagues/[id]` - Public view for a specific league

## Security Considerations

- Only leagues explicitly marked as public (isPublic = true) are accessible without authentication
- Sensitive league data (such as player contact information) is not exposed in public views
- The API endpoints filter out private leagues automatically
- Rate limiting is applied to public endpoints to prevent abuse

## Usage

### For League Administrators

1. **Creating a Public League**
   - When creating or editing a league, ensure the "Make this league publicly viewable" checkbox is selected.

2. **Sharing a League**
   - On the league dashboard, click the "Share League" button to copy the public URL to your clipboard.
   - Share this URL with players, friends, or on social media.

3. **Making a League Private**
   - If you need to make a league private, edit the league and uncheck the "Make this league publicly viewable" option.

### For Users / Spectators

1. **Browsing Leagues**
   - Visit `/leagues` to browse all public leagues.
   - Use filters (if available) to find leagues by status or other criteria.

2. **Viewing a Specific League**
   - Click on a league card to view detailed information.
   - Or navigate directly to `/leagues/[league-id]` if you have the link.

## Future Enhancements

Potential improvements to consider for future iterations:

1. **Enhanced SEO**: Improve metadata and add structured data for better search engine visibility.
2. **Social Sharing Cards**: Add Open Graph and Twitter Card metadata for rich previews when sharing on social media.
3. **Public Comments**: Allow public users to leave comments on matches or leagues.
4. **Embeddable Widgets**: Create embeddable widgets for rankings or schedules that can be placed on other websites.
5. **Advanced Statistics**: Add more detailed statistics and visualizations to the public view.
