# Admin Workflow Implementation Status

This document tracks the progress of implementing the role-based access control and admin workflow features in the casino-liga project.

## 1. Data Model Adjustments

- [x] **Player model**:
   - [x] Add `email` field (required for admin-created players)
   - [x] Add `status` field (e.g., "invited", "active", "pending")
   - [x] Add `invitationSent` flag
   - [x] Add invitation tracking (token and expiration date)

- [x] **User model**:
   - [x] Email as unique identifier
   - [x] Add `invitedPlayerId` to track invited users who haven't completed setup

## 2. Admin League Management Flow

- [x] **Admin creates a league**
   - [x] Basic admin section structure added
   - [x] League management UI components created (`components/admin/LeagueManagement.tsx`)
   - [x] League creation page (`dashboard/leagues/create/page.tsx`)
   - [ ] Complete integration with invitation system

- [x] **Admin adds players to the league**
   - [x] Admin API endpoints for player management created
   - [x] Player management component created (`components/admin/PlayerManagement.tsx`)
   - [ ] Complete integration with league management flow

- [x] **Admin creates teams from these players**
   - [x] Team creation form component created (`components/admin/TeamCreationForm.tsx`)
   - [ ] Complete integration with league management flow
   - [ ] Functionality to add teams to leagues

- [ ] **System sends invitations**
   - [ ] Email sending service integration
   - [x] Backend support for invitation tokens
   - [x] API endpoint for inviting players (`api/admin/players/[id]/invite/route.ts`)
   - [ ] Frontend UI for managing invitations

- [ ] **Player registration flow**
   - [ ] Modified registration flow for invited players
   - [x] Model relationships to link User accounts to existing Player profiles
   - [ ] UI to convert "invited" status to "active"

## 3. Implementation Components

- [x] **Admin League Management Pages**:
   - [x] Basic admin section setup
   - [x] League creation and management UI components
   - [x] Player management component
   - [x] Team formation interface components

- [ ] **Player Invitation System**:
   - [ ] Email sending service
   - [x] Token generation for one-time links (model support)
   - [x] API endpoint for invitations
   - [ ] Complete invite flow integration

- [ ] **User Registration Enhancement**:
   - [x] Backend model support for invited players
   - [ ] Frontend flow for invited players
   - [ ] Logic to link User accounts to existing Player profiles

- [x] **Database Relationships**:
   - [x] User → Player (one-to-one)
   - [x] Player → Teams (many-to-many)
   - [x] Teams → Leagues (many-to-many)

## 4. API Endpoints

- [x] `/api/admin/players` - Create/manage players without user accounts
- [x] `/api/admin/players/[id]/invite` - Invite a player
- [x] League endpoints exist in standard API (`/api/leagues`)
- [x] Team endpoints exist in standard API (`/api/teams`)
- [ ] Complete `/api/auth/invite` - Process invitation tokens and register users

## Next Steps and Priorities

1. Complete the integration between components (league management, player management, and team creation)
2. Develop the email invitation system
3. Finish the specialized registration flow for invited players
4. Implement the auth/invite endpoint
5. Test the end-to-end flow