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

- **Task 1.1:** Modify the User model to include a `role` field
- **Task 1.2:** Update the user registration process to assign a default role
- **Task 1.3:** Create a migration script to add roles to existing users

### 2. Update Authentication System

- **Task 2.1:** Update NextAuth configuration to include the user's role in the session
- **Task 2.2:** Create middleware or hooks to check role-based permissions
- **Task 2.3:** Create utility functions for role checking (isAdmin, etc.)

### 3. Modify Navigation Menu

- **Task 3.1:** Identify the component that renders the navigation menu
- **Task 3.2:** Update it to conditionally render menu items based on user role
- **Task 3.3:** Ensure "Leagues" option only appears for admin users

### 4. Add Role-Based Route Protection

- **Task 4.1:** Create a withRoleAuth HOC to extend the existing withAuth component
- **Task 4.2:** Apply role-based protection to league management routes
- **Task 4.3:** Add server-side role checks to protect API endpoints

### 5. Create League Association for Normal Users

- **Task 5.1:** Modify the Player model to include league associations
- **Task 5.2:** Create API to fetch a player's leagues/teams
- **Task 5.3:** Update front-end to show only relevant league data

### 6. Admin Management Interface

- **Task 6.1:** Create an admin dashboard for user management
- **Task 6.2:** Add functionality to assign/change user roles
- **Task 6.3:** Implement UI for associating players with leagues

### 7. Update UI/UX for Player-Focused Experience

- **Task 7.1:** Create a player dashboard showing their leagues/teams
- **Task 7.2:** Update matches view to filter by player's leagues
- **Task 7.3:** Redesign rankings view to default to player's league

### 8. Testing and Validation

- **Task 8.1:** Create test cases for role-based access
- **Task 8.2:** Test admin functionality
- **Task 8.3:** Test player-restricted views
- **Task 8.4:** Validate security of role-based restrictions

## Detailed Implementation Steps

### Phase 1: User Model & Authentication Updates

```typescript
// 1.1: Update User model (src/models/user.ts)
const userSchema = new mongoose.Schema({
  // Existing fields
  email: { /* ... */ },
  password: { /* ... */ },
  // Add role field
  role: {
    type: String,
    enum: ['admin', 'player'],
    default: 'player'
  }
});

// 2.1: Update NextAuth config (src/lib/auth/auth-options.ts)
callbacks: {
  session({ session, user }) {
    if (session.user) {
      session.user.id = user.id;
      session.user.role = user.role; // Include role in session
    }
    return session;
  }
}

// 2.2: Create role check utility (src/lib/auth/role-utils.ts)
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin';
}

export function hasAccess(session: Session | null, requiredRoles: string[]): boolean {
  return session?.user?.role && requiredRoles.includes(session.user.role);
}
```

### Phase 2: Navigation Menu Update

```typescript
// 3.2: Update navigation component (src/components/layout/PadelNavigation.tsx)
import { useSession } from "next-auth/react";
import { isAdmin } from "@/lib/auth/role-utils";

function PadelNavigation() {
  const { data: session } = useSession();
  
  return (
    <nav>
      <Link href="/dashboard/player-profile">Player Profile</Link>
      <Link href="/dashboard/teams">Teams</Link>
      
      {/* Only show Leagues for admins */}
      {isAdmin(session) && (
        <Link href="/dashboard/leagues">Leagues</Link>
      )}
      
      <Link href="/dashboard/matches">Matches</Link>
      <Link href="/dashboard/rankings">Rankings</Link>
    </nav>
  );
}
```

### Phase 3: Route Protection

```typescript
// 4.1: Create withRoleAuth HOC (src/components/auth/withRoleAuth.tsx)
import { useSession } from "next-auth/react";
import { hasAccess } from "@/lib/auth/role-utils";

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

// Apply to admin routes:
// src/app/dashboard/leagues/page.tsx
export default withRoleAuth(LeaguesPage, ['admin']);
```

### Phase 4: API Route Protection

```typescript
// Add middleware for API route protection (src/app/api/leagues/route.ts)
async function isAuthorized(req: Request) {
  const session = await getServerSession();
  return session?.user?.role === 'admin';
}

export async function GET(request: Request) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Continue with existing code...
}
```

## Migration Strategy

To add roles to existing users, we'll need to create a migration script:

```typescript
// scripts/add-roles-to-users.ts
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models';

async function migrateUsers() {
  try {
    await connectDB();
    
    // Add default role to all users who don't have one
    const result = await UserModel.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'player' } }
    );
    
    console.log(`Updated ${result.modifiedCount} users with default role 'player'`);
    
    // You could also set specific users as admins here
    // await UserModel.updateOne({ email: 'admin@example.com' }, { role: 'admin' });
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateUsers();
```

## Progress Tracking Checklist

- [ ] **User Model Updates**
  - [ ] Add role field to User model
  - [ ] Add migration for existing users
  - [ ] Update user creation to set default role

- [ ] **Authentication Updates**
  - [ ] Include role in session
  - [ ] Create role check utilities
  - [ ] Update login/registration flow

- [ ] **UI Updates**
  - [ ] Modify navigation component
  - [ ] Create admin dashboard components
  - [ ] Create player-focused dashboard view

- [ ] **Route Protection**
  - [ ] Create role-based HOC
  - [ ] Protect admin routes
  - [ ] Add API route protection

- [ ] **Player League Association**
  - [ ] Update Player model with league connection
  - [ ] Create league membership system
  - [ ] Add UI for league membership management

- [ ] **Testing**
  - [ ] Create admin test account
  - [ ] Create player test account
  - [ ] Validate all protected routes
  - [ ] Test league-specific content filtering
