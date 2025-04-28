# Authentication Flow

## Overview

Padeliga uses NextAuth.js for authentication and implements a hybrid public/protected routing approach. This document outlines how authentication works in the application.

## Authentication Structure

The application is organized into two main sections:

1. **Public Routes** - Located in `src/app/(public)`
   - Accessible to anyone, both logged-in and non-logged-in users
   - Includes pages like homepage, public league views, and authentication pages

2. **Protected Routes** - Located in `src/app/dashboard`
   - Requires authentication
   - Contains all user-specific functionality
   - Redirects to login if accessed without authentication

## Authentication Flow

### Login Process

1. User visits `/login`
2. User enters credentials
3. System authenticates via NextAuth.js
4. On success, user is redirected to `/dashboard`
5. On failure, error message is displayed

### Protected Route Access

When a user attempts to access a protected route:

1. Middleware checks for a valid session token
2. If authenticated, the request proceeds
3. If not authenticated, the user is redirected to `/login?callbackUrl={attempted_url}`
4. After successful login, the user is redirected to the originally requested URL

### Home Page Behavior

1. Non-authenticated users see the public landing page
2. Authenticated users are automatically redirected to `/dashboard`

## Implementation Details

### Middleware

The middleware (`src/middleware.ts`) is responsible for:

- Protecting access to dashboard routes
- Redirecting unauthenticated users to login
- Allowing public routes without authentication

### Authentication Components

- `withAuth.tsx` - Higher-order component for client-side route protection
- `withRoleAuth.tsx` - Higher-order component with role-based access control

### Public Layout

The public layout (`src/app/(public)/layout.tsx`):

- Conditionally shows different navigation options based on authentication status
- Provides a dashboard link for authenticated users
- Shows login/signup for non-authenticated users

## Role-Based Access Control

Padeliga implements role-based permissions:

- `ADMIN` - Full access to all features
- `PLAYER` - Access to player-specific features
- `USER` - Basic access to core features

Role checks are performed using utility functions in `src/lib/auth/role-utils.ts`.

## Testing Authentication

To test authentication flows:

1. Log out and verify you see the public landing page
2. Try accessing `/dashboard` directly - it should redirect to login
3. Log in and verify you're taken to the dashboard
4. Navigate to public pages while logged in - you should see a dashboard link in the header

## Troubleshooting

If authentication issues occur:

1. Check browser cookies and session storage
2. Verify NextAuth.js is properly configured
3. Check for CORS issues with API routes
4. Review middleware configuration for correct route protection