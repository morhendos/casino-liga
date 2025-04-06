# Player, Team, and League Management Guide

This document explains how to use the admin functionality to create and manage players, teams, and leagues.

## Overview

The Casino Liga system allows administrators to:

1. Create players and send them invitations to join
2. Create leagues with detailed settings
3. Add players to teams and assign them to leagues
4. Manage schedules and rankings

## Admin Workflow

### 1. Creating and Inviting Players

1. **Navigate to Admin Dashboard**: Access the Admin Dashboard from the main navigation.
2. **Open Invitations Tab**: Click on the "Invitations" tab.
3. **Create New Player**:
   - Fill in the player's nickname and email
   - Click "Create & Invite Player"
   - The system will automatically send an invitation email to the player

### 2. Creating Leagues

1. **Navigate to Admin Dashboard**: Access the Admin Dashboard from the main navigation.
2. **Open Leagues Tab**: Click on the "Leagues" tab.
3. **Create New League**:
   - Click "Create League"
   - Fill in the league details (name, dates, format, etc.)
   - Save the league

### 3. Adding Players to Teams and Leagues

1. **Open League Management**:
   - Navigate to the leagues list 
   - Click on a league to view its details
   - Click "Manage League" (visible only to admins)
   
2. **Add Players to League**:
   - In the league management page, click on the "Add Players" tab
   - Browse and search for players
   - Select players to add to a team
   - Enter a team name
   - Click "Create Team & Add to League"

3. **Manage Teams**:
   - In the league management page, click on the "Manage Teams" tab
   - View all teams in the league
   - Invite additional teams if needed

### 4. Managing Leagues

1. **League Settings**:
   - Edit league details
   - Change league status (draft, registration, active, completed)
   
2. **Schedule Management**:
   - Generate match schedules
   - View and edit schedules

## Player Invitation Flow

1. **Admin creates a player**: Admin adds basic player details including email
2. **Invitation is sent**: System sends an email with a secure token link
3. **Player registers**: The player clicks the link and completes registration
4. **Account is linked**: The new user account is automatically linked to the player profile

## Using the League Player Manager

The League Player Manager allows you to:

1. **Search for players**: Find players by name or email
2. **Create teams**: Select up to 2 players and assign them to a team
3. **Add teams to leagues**: Teams you create are automatically added to the current league

## Notes and Best Practices

1. **Player emails**: Always double-check email addresses before sending invitations
2. **Team composition**: Teams can have 1-2 players, typically 2 for padel leagues
3. **League settings**: Set appropriate registration deadlines and schedule dates
4. **Team visibility**: Teams will be visible in the league details page after adding

## Troubleshooting

If you encounter issues with the player-team-league management:

1. **Player not receiving invitations**: Check the email address and server logs
2. **Teams not appearing in league**: Refresh the page or check the league details
3. **League management not visible**: Ensure you have admin permissions

## Next Steps

- In the future, we'll add bulk invitation capabilities
- Team management will be enhanced with ranking adjustments
- Additional schedule generation options will be implemented

For any questions or issues, contact the system administrator.
