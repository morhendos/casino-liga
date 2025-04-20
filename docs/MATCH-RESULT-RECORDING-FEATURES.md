# Match Result Recording Features

This document outlines the match result recording functionality implemented in Padeliga.

## Overview

The match result recording system enables:

1. Recording and validating match results (scores for each set)
2. Automatic calculation of match winners
3. Automatic updating of league rankings
4. Viewing team standings and statistics
5. Managing permissions for result recording

## Components

### Match Result Form

The `MatchResultForm` component provides:

- Set-by-set score input for both teams
- Validation for score entries (ensuring valid scores with proper point differences)
- Automatic calculation of the winner based on sets won
- Support for different match formats (best of 3, best of 5, single set)
- Confirmation dialog before submitting results
- Error handling and user feedback

### League Rankings Table

The `LeagueRankingsTable` component displays:

- Current team standings in a league
- Key statistics for each team (matches played, won, lost)
- Points accumulated by each team
- Optional set statistics
- Position indicators (current position and changes)
- Visual indicators for top teams

### Rankings API

The rankings system includes:

- Automatic ranking updates when match results are recorded
- API for fetching current rankings for a league
- API for manually recalculating all rankings
- Sorting by points, wins, and other tiebreakers

## How to Use

### For Administrators and League Organizers

1. **Record Match Results:**
   - Navigate to a match details page
   - Click the "Record Result" button
   - Enter scores for each set played
   - Confirm and save the result
   - Rankings are automatically updated

2. **Manage Rankings:**
   - Visit the league rankings page
   - View current standings and statistics
   - Use the "Recalculate Rankings" button to refresh all rankings if needed

3. **Review Match Results:**
   - View match details to see recorded results
   - Edit results if corrections are needed

### For Players

1. **Record Your Match Results:**
   - After your match is completed, navigate to the match details page
   - If you are a participant in the match, you can record the result
   - Enter scores for each set and submit

2. **View Team Standings:**
   - Visit the league rankings page to see where your team stands
   - Track your progress throughout the league

## Technical Implementation

The match result recording system uses:

- Model-based validation for score consistency and match rules
- RESTful API endpoints for CRUD operations:
  - PUT `/api/matches/[id]/result` - Record or update a match result
  - GET `/api/matches/[id]/result` - Get a match result
  - GET `/api/leagues/[id]/rankings` - Get the rankings for a league
  - POST `/api/leagues/[id]/rankings/recalculate` - Force recalculate rankings

- Mongoose schemas for storing match results and rankings:
  - Match schema with result field containing scores and winner
  - Ranking schema for storing team statistics and points

## Limitations and Future Enhancements

Current limitations:
- Basic score validation (minimum 2-point difference)
- Manual recalculation required for bulk changes
- Limited statistics tracking

Planned enhancements:
- Advanced statistics (points per game, average scores)
- Historical ranking tracking
- Performance charts and visualizations
- Player-specific statistics
- Result confirmation workflow (requiring both teams to confirm)
- Notification system for match results
