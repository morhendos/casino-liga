# Testing Guide for Role-Based Access Control

This document provides guidelines for testing the role-based access control system in the Padeliga application.

## Prerequisites

1. A running instance of the application with:
   - MongoDB configured
   - Environment variables set up
   - At least two user accounts created (admin and player)

## Setting Up Test Accounts

### Admin User

To set up an admin user account:

1. Create a user account through the signup page
2. Run the following command to grant admin privileges:

```bash
npm run add-admin user@example.com
```

Replace `user@example.com` with the email address of the account.

### Player User

No special setup is needed for player users; simply create an account through the signup page.

## Test Cases

### 1. Navigation Menu Testing

| Test Case | Admin User | Regular User |
|-----------|------------|--------------|
| View "Leagues" menu item | Should be visible | Should NOT be visible |
| View "My Leagues" menu item | Should NOT be visible | Should be visible |
| View "Admin" menu item | Should be visible | Should NOT be visible |
| View "Rankings" menu item | Should be visible | Should NOT be visible |
| View "My Rankings" menu item | Should NOT be visible | Should be visible |
| View "Player Profile" menu item | Should be visible | Should be visible |
| View "Teams" menu item | Should be visible | Should be visible |
| View "Matches" menu item | Should be visible | Should be visible |

### 2. Page Access Testing

| Test Case | Admin User | Regular User |
|-----------|------------|--------------|
| Access `/dashboard/leagues` | Should load without errors | Should redirect or show unauthorized |
| Access `/dashboard/leagues/create` | Should load without errors | Should redirect or show unauthorized |
| Access `/dashboard/admin` | Should load without errors | Should redirect or show unauthorized |
| Access `/dashboard/my-leagues` | Should redirect | Should load without errors |
| Access `/dashboard/my-rankings` | Should redirect | Should load without errors |

### 3. API Access Testing

Use a tool like Postman or curl to test API endpoints:

| Test Case | Admin User | Regular User |
|-----------|------------|--------------|
| POST `/api/leagues` | Should return 201 Created | Should return 403 Forbidden |
| GET `/api/admin/users` | Should return 200 OK | Should return 403 Forbidden |
| PATCH `/api/admin/users` | Should return 200 OK | Should return 403 Forbidden |
| GET `/api/players/leagues` | Should return 200 OK | Should return 200 OK (empty if no leagues) |

### 4. Admin Dashboard Testing

When logged in as admin:

1. Test user management:
   - Search for users
   - Grant/revoke admin privileges
   
2. Test role management:
   - Verify role documentation is visible
   
3. Test league management:
   - Search for leagues
   - Filter by status
   - Access league details

### 5. Player-Specific Views Testing

When logged in as a regular player:

1. Test "My Leagues" page:
   - Should only show leagues where the player is participating
   - Create a team and join a league to verify it appears
   
2. Test "My Rankings" page:
   - Should only offer selection of leagues where the player is participating
   - Verify the player's team is highlighted

## Security Verification

Perform these checks to validate the security of the role-based access control:

1. **Direct URL Access**: Try accessing admin URLs directly as a player user
2. **API Direct Access**: Try accessing admin API endpoints directly with player credentials
3. **Local Storage Tampering**: Attempt to modify the session token in local storage
4. **Route Parameter Manipulation**: Try accessing other players' data by manipulating route parameters

## Test Reporting

When testing is complete, document your findings with:

1. Any issues or bugs discovered
2. Confirmation of properly functioning features
3. Suggestions for improvements or enhancements

## Test Summary Checklist

- [ ] Admin user navigation tested
- [ ] Player user navigation tested
- [ ] Admin page access tested
- [ ] Player page access tested
- [ ] Admin API access tested
- [ ] Player API access tested
- [ ] Admin dashboard functionality tested
- [ ] Player-specific views tested
- [ ] Security verification performed
