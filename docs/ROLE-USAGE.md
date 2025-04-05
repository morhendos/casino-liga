# Role-Based Access Control Usage

This document explains how to use the role-based access control system in the Casino Liga application.

## User Roles

The application supports two main roles:

1. **Player (Default)**: Regular users who can join leagues, create teams, and participate in matches
2. **Admin**: Users who can create and manage leagues, in addition to all player capabilities

## Setting Up Admin Users

To assign the admin role to a user:

```bash
# Run the admin role assignment script
npm run add-admin user@example.com
```

Replace `user@example.com` with the email address of the user to promote to admin.

## Role-Based UI Elements

The navigation menu will automatically adjust based on user roles:

- **Admin users** will see all menu options including "Leagues"
- **Player users** will see all options except "Leagues"

## Protected Routes

The following routes are protected and require specific roles:

- `/dashboard/leagues/*` - Requires admin role
- `/api/leagues` (POST) - Requires admin role for creating leagues

## Using Role Utilities

When developing new features, you can use the role utility functions:

```typescript
import { isAdmin, hasRole, ROLES } from "@/lib/auth/role-utils";
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  
  // Check if user is an admin
  if (isAdmin(session)) {
    // Show admin-specific UI
  }
  
  // Check for specific role
  if (hasRole(session, ROLES.PLAYER)) {
    // Show player-specific UI
  }
}
```

## Protecting Components

To protect components based on roles, use the `withRoleAuth` HOC:

```typescript
import withRoleAuth from "@/components/auth/withRoleAuth";
import { ROLES } from "@/lib/auth/role-utils";

function AdminOnlyComponent() {
  // Component implementation
}

// Export with role protection
export default withRoleAuth(AdminOnlyComponent, [ROLES.ADMIN]);
```

## Protecting API Routes

For API routes, you can check roles using:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

export async function POST(request: Request) {
  // Check if user has admin role
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return NextResponse.json(
      { error: 'Forbidden: Admin privileges required' },
      { status: 403 }
    );
  }
  
  // Continue with admin-only operation
}
```

## Development & Testing

When testing, create at least two user accounts:

1. An admin user (use the `add-admin` script)
2. A regular player user (default registration)

Test with both accounts to ensure the role-based restrictions work correctly.
