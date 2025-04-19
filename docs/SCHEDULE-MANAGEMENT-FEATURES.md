# Schedule Management Features

This document outlines the schedule generation and management functionality implemented in Casino Liga.

## Overview

The schedule management system enables league administrators to:

1. Generate round-robin schedules for leagues
2. View and edit match details (times, locations, status)
3. Visualize the schedule in calendar or list view
4. Filter schedules by team
5. View basic match details
6. Print or export the league schedule

Players can view the schedule and access match details for their leagues.

## Components

### Schedule Generation

The `ScheduleGenerationForm` component allows administrators to:

- Generate round-robin schedules for a league
- Configure scheduling parameters:
  - Match dates within the league timeframe
  - Number of matches per day
  - Default venue for all matches
- Validate requirements for schedule generation (minimum teams, sufficient dates)

### Schedule Management

The `ScheduleManagementTable` component provides:

- A tabular view of all matches grouped by date
- Inline editing of match details:
  - Time
  - Location
  - Status (Scheduled, In Progress, Completed, Postponed, Canceled)
- Ability to clear the schedule and regenerate if needed
- Visual indicators for match status

### Schedule Visualization

The `ScheduleVisualization` component offers:

- Multiple view options:
  - Calendar view showing matches by day
  - List view showing matches grouped by date
- Team filtering to focus on specific teams' matches
- Print/export functionality for physical copies
- Interactive navigation between months in calendar view

### Match Details

The `MatchDetailsPage` component provides:

- A simple view of individual match information
- Display of teams, date, time, location and status
- Visual indicators for match status
- Navigation back to the league view

## How to Use

### For Administrators

1. **Generate a Schedule:**
   - Navigate to the league's management page
   - Select the "Schedule" tab
   - Click "Generate Schedule" if no schedule exists
   - Configure scheduling parameters and submit

2. **Manage Schedules:**
   - From the league schedule page, select the "Manage Matches" tab
   - Edit match details by clicking the "Edit" button for any match
   - Update times, locations, or status as needed
   - Click "Save" to persist changes

3. **View and Filter:**
   - Use the calendar or list view to visualize the schedule
   - Filter by team to focus on specific teams' matches
   - Use the print button to generate a printable version

4. **Access Match Details:**
   - Click on any match in the schedule to view detailed information
   - See teams, date, time, location, and current status

### For Players

1. **View League Schedule:**
   - Navigate to the league details page
   - Click on "View Schedule" or the Schedule tab
   - See all matches in the league with details
   - Filter to view only matches for your team

2. **Access Match Details:**
   - Click on any match in the schedule to view detailed information
   - See match status, location, and time

## Technical Implementation

The schedule management system uses:

- The built-in `scheduleGenerator.ts` utility to create round-robin schedules
- RESTful API endpoints for CRUD operations:
  - GET `/api/leagues/[id]/schedule` - Get the schedule for a league
  - POST `/api/leagues/[id]/schedule` - Generate a schedule
  - DELETE `/api/leagues/[id]/schedule` - Clear a schedule
  - PATCH `/api/matches/[id]` - Update a match
  - GET `/api/matches/[id]` - Get match details

## Limitations and Future Enhancements

Current limitations:
- Only round-robin scheduling is supported (one match between each team pair)
- No drag-and-drop rescheduling interface
- Limited export formats (print only)
- Basic match details view without score recording functionality

Planned enhancements:
- Double round-robin scheduling (home and away matches)
- Drag-and-drop interface for rescheduling
- Export to calendar formats (iCal, Google Calendar)
- Automatic notifications for schedule changes
- Time conflict detection for venues
- Match result recording with score tracking
- Match statistics and performance metrics
