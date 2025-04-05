# Implementation Plan: Role-Based Access Control for Casino Liga

This document outlines the comprehensive plan to implement role-based access control in the Casino Liga application, with two main roles:
- **Admin users**: Can create and manage leagues, and have full access to all features
- **Player users**: Can only see and interact with leagues they're part of

## Current State Analysis

Based on the project structure, the application uses:
- Next.js with App Router for frontend
- NextAuth.js for authentication
- MongoDB for data storage
- User and Player models (likely separate entities)

## Implementation Plan

### 1. Enhance User Model with Roles

First, we need to add role capabilities to the user model:

- **Task 1.1:** ✅ Identify existing User model with roles field (already implemented)
- **Task 1.2:** ✅ Create a role utility helper file
- **Task 1.3:** ✅ Create a migration script to add admin roles to existing users

### 2. Update Authentication System

- **Task 2.1:** ✅ Confirm NextAuth configuration includes user's roles in session (already implemented)
- **Task 2.2:** ✅ Create middleware or hooks to check role-based permissions
- **Task 2.3:** ✅ Create utility functions for role checking (isAdmin, etc.)

### 3. Modify Navigation Menu

- **Task 3.1:** ✅ Identify the component that renders the navigation menu
- **Task 3.2:** ✅ Update it to conditionally render menu items based on user role
- **Task 3.3:** ✅ Ensure "Leagues" option only appears for admin users

### 4. Add Role-Based Route Protection

- **Task 4.1:** ✅ Create a withRoleAuth HOC to extend the existing withAuth component
- **Task 4.2:** ✅ Apply role-based protection to league management routes
- **Task 4.3:** ✅ Add server-side role checks to protect API endpoints

### 5. Create League Association for Normal Users

- **Task 5.1:** ✅ No changes required to Player model as we're using existing relationships
- **Task 5.2:** ✅ Create API to fetch a player's leagues/teams
- **Task 5.3:** ✅ Update front-end to show only relevant league data

### 6. Admin Management Interface

- **Task 6.1:** ⬜️ Create an admin dashboard for user management
- **Task 6.2:** ⬜️ Add functionality to assign/change user roles
- **Task 6.3:** ⬜️ Implement UI for associating players with leagues

### 7. Update UI/UX for Player-Focused Experience

- **Task 7.1:** ✅ Create a player dashboard showing their leagues/teams
- **Task 7.2:** ✅ Update matches view to filter by player's leagues (already implemented)
- **Task 7.3:** ⬜️ Redesign rankings view to default to player's league

### 8. Testing and Validation

- **Task 8.1:** ✅ Create admin role assignment script for creating test accounts
- **Task 8.2:** ⬜️ Test admin functionality
- **Task 8.3:** ⬜️ Test player-restricted views
- **Task 8.4:** ⬜️ Validate security of role-based restrictions

## Detailed Implementation Steps

### Phase 1: User Model & Authentication Updates

```typescript
// 1.2: Create role check utility (src/lib/auth/role-utils.ts) - COMPLETED

export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ROLES.ADMIN);
}

export function hasRole(session: Session | null, roleId: string): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) {
    return false;
  }
  
  return session.user.roles.some(role => role.id === roleId);
}
```

### Phase 2: Navigation Menu Update

```typescript
// 3.2: Update navigation component (src/components/layout/PadelNavigation.tsx) - COMPLETED

function PadelNavigation() {
  const { data: session } = useSession();
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    // If an item is marked as adminOnly, check if the user is an admin
    if (item.adminOnly) {
      return isAdmin(session);
    }
    // If an item is marked as playerOnly, check if the user is a player
    if (item.playerOnly) {
      return isPlayer(session);
    }
    // Otherwise show the item to all authenticated users
    return true;
  });
  
  return (
    // ... render menu with filteredNavItems
  );
}
```

### Phase 3: Route Protection

```typescript
// 4.1: Create withRoleAuth HOC (src/components/auth/withRoleAuth.tsx) - COMPLETED

function withRoleAuth(Component, requiredRoles = ['admin']) {
  return function AuthenticatedComponent(props) {
    const { data: session, status } = useSession();
    
    if (status === "loading") {
      return <div>Loading...</div>;
    }
    
    if (!session || !hasAccess(session, requiredRoles)) {
      return <div>Unauthorized: You don't have permission to view this page</div>;
    }
    
    return <Component {...props} />;
  };
}

// Apply to admin routes - COMPLETED
export default withRoleAuth(LeaguesPage, [ROLES.ADMIN]);
```

### Phase 4: API Route Protection

```typescript
// Add middleware for API route protection (src/app/api/leagues/route.ts) - COMPLETED

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

export async function POST(request: Request) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return NextResponse.json(
      { error: 'Forbidden: Admin privileges required' },
      { status: 403 }
    );
  }
  
  // Continue with existing code...
}
```

### Phase 5: Player-League Association

```typescript
// Add API for player leagues (src/app/api/players/leagues/route.ts) - COMPLETED

export async function GET(request: Request) {
  // Get current user's session
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Find player profile for current user
  const player = await PlayerModel.findOne({ userId: session.user.id });
  
  // Find teams where player is a member
  const teams = await TeamModel.find({ players: player._id });
  
  // Find leagues where these teams are participating
  const leagues = await LeagueModel.find({ teams: { $in: teamIds } });
  
  return NextResponse.json({ leagues });
}
```

## Migration Strategy

We've created a script to add roles to existing users:

```typescript
// scripts/seed-admin-role.js - COMPLETED
```

## Progress Tracking Checklist

- [x] **User Model Updates**
  - [x] Confirm role field in User model is suitable
  - [x] Add migration for existing users
  - [x] Update user creation to set default role

- [x] **Authentication Updates**
  - [x] Include role in session
  - [x] Create role check utilities
  - [x] Update login/registration flow

- [x] **UI Updates**
  - [x] Modify navigation component
  - [ ] Create admin dashboard components
  - [x] Create player-focused dashboard view

- [x] **Route Protection**
  - [x] Create role-based HOC
  - [x] Protect admin routes
  - [x] Add API route protection

- [x] **Player League Association**
  - [x] Use existing Player model with team connections
  - [x] Create API endpoint for player's leagues
  - [x] Create a "My Leagues" dashboard view

- [ ] **Testing**
  - [x] Create admin test account script
  - [ ] Create player test account
  - [ ] Validate all protected routes
  - [ ] Test league-specific content filtering

## Next Steps

To complete the implementation, we should focus on:

1. Creating the admin interface for user and role management
2. Enhancing the rankings view to default to player's league
3. Comprehensive testing of the role-based access control system

## Usage Documentation

For detailed usage instructions, please refer to [ROLE-USAGE.md](./ROLE-USAGE.md).
