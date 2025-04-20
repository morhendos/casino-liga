# Admin Invitation Flow: Testing Guide

This document provides a step-by-step guide for testing the new player invitation system in the Padeliga application.

## Prerequisites

1. Make sure you have a local MongoDB instance running
2. Ensure you've set up your `.env.local` file with appropriate configuration
3. Have an admin user already created in the system (or create one using the database seeding script)

## Testing the Invitation Flow

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Access the Admin Dashboard

1. Log in with an admin account
2. Navigate to the Admin Dashboard section of the application

### Step 3: Create and Invite a Player

1. In the Admin Dashboard, click on the "Invitations" tab
2. Use the "Add New Player" form to create a new player:
   - Enter a nickname (e.g., "TestPlayer")
   - Enter a valid email address (e.g., "testplayer@example.com")
   - Click "Create & Invite Player"
3. You should see a success toast notification
4. The player should now appear in the "Invited Players" section

### Step 4: Check the Invitation Link

Since we're using a simulated email service in development, the invitation link is logged to the console instead of being sent via email.

1. Check your terminal/console where the server is running
2. Look for a log entry that contains "SENDING INVITATION EMAIL to..."
3. Copy the invitation link from the log

The link format should be:
```
http://localhost:3000/auth/invite?token=<invitation-token>
```

### Step 5: Test the Registration Process

1. Open the invitation link in a new browser window/tab
2. You should see the invitation registration page
3. The email field should be pre-filled and non-editable
4. Enter a name (or keep the pre-filled one)
5. Create a password and confirm it
6. Submit the form
7. You should be redirected to the login page with a success message

### Step 6: Verify Account Creation

1. Log in with the newly created account (using the email and password from Step 5)
2. You should now have access to the system as a regular user
3. The player profile should be linked to your account

### Step 7: Verify in Admin Dashboard

1. Log back in as an admin
2. Go to the Admin Dashboard
3. Check the "Invitations" tab
4. The player should now appear in the "Active Players" section

## Testing Error Scenarios

### Test Expired Tokens

The invitation tokens expire after 7 days by default. To test expiration:

1. Modify the `invitationExpires` date in the database to a past date
2. Try accessing the invitation link
3. You should see an "Invalid Invitation" message

### Test Invalid Tokens

1. Modify the token in the URL (e.g., change a character)
2. Try accessing the invitation link
3. You should see an "Invalid Invitation" message

### Test User Already Exists

1. Create a new player with an email that already has a user account
2. Send an invitation to this player
3. When trying to register, you should see an error message about the user already existing

## Implementation Details

### Key Files

- **Email Service**: `src/lib/services/email-service.ts`
- **Invitation Service**: `src/lib/services/invitation-service.ts`
- **Invitation API**: `src/app/api/auth/invite/route.ts`
- **Player Invite API**: `src/app/api/admin/players/[id]/invite/route.ts`
- **Invitation UI**: `src/components/admin/PlayerInvitationManagement.tsx`
- **Registration Page**: `src/app/auth/invite/page.tsx`

### Debugging Tips

1. Check the console logs for invitation tokens and links
2. Use browser developer tools to monitor API calls
3. Monitor the MongoDB database to see player and user record changes
4. For detailed logging, add more `console.log` statements in the relevant files

## Known Limitations

1. Email sending is simulated (logged to console) instead of using a real email provider
2. No resend functionality for invitations
3. Limited error handling in some edge cases

## Next Steps for Development

1. Integrate with a real email service provider
2. Add functionality to resend invitations
3. Implement better error handling
4. Add bulk invitation capability
