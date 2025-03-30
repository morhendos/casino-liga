# Service Function Pattern

This document describes the recommended pattern for implementing service functions in the SaaS application.

## What are Service Functions?

Service functions are pure JavaScript/TypeScript functions that encapsulate business logic and data access operations. They provide a clean separation between the API layer (HTTP routes) and the data layer (database queries).

## Why Use Service Functions?

- **Separation of Concerns**: Keeps business logic separate from HTTP handling
- **Reusability**: Functions can be used across different parts of the application
- **Testability**: Makes unit testing easier with clearly defined inputs and outputs
- **Consistency**: Establishes a standard pattern for handling similar operations

## Service Function Structure

### Basic Pattern

```typescript
// src/lib/services/user-service.ts

import { withConnection } from '@/lib/db/simplified-connection';
import { withErrorHandling } from '@/lib/db/unified-error-handler';
import { UserModel } from '@/models/user';
import { User } from '@/types/user';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  return withErrorHandling(async () => {
    return withConnection(async () => {
      const user = await UserModel.findById(userId)
        .lean()
        .exec();

      if (!user) {
        return null;
      }

      return formatUser(user);
    });
  }, 'getUserById');
}

/**
 * Create a new user
 */
export async function createUser(
  data: { email: string; name: string; }
): Promise<User> {
  return withErrorHandling(async () => {
    return withConnection(async () => {
      const user = await UserModel.create({
        ...data,
        roles: [{ id: '1', name: 'user' }]
      });

      return formatUser(user);
    });
  }, 'createUser');
}

// Helper function to format user data consistently
function formatUser(user: any): User {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    // ... other fields
  };
}
```

### Usage in API Routes

```typescript
// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createErrorResponse } from '@/lib/db/unified-error-handler';
import { MongoDBErrorCode } from '@/lib/db/error-handler';
import { getUserById } from '@/lib/services/user-service';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication required',
          code: 'auth.unauthorized'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await getUserById(session.user.id);
    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('GET /api/users error:', error);
    
    const errorResponse = createErrorResponse(error);
    
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { 
        status: (errorResponse.code === MongoDBErrorCode.CONNECTION_FAILED || 
                errorResponse.code === MongoDBErrorCode.CONNECTION_TIMEOUT) ? 503 : 500 
      }
    );
  }
}
```

## Best Practices

1. **Function Naming**:
   - Use descriptive verb-noun pairs: `getUserById`, `createUser`
   - Avoid generic names like `getData` or `processItem`

2. **Error Handling**:
   - Always use `withErrorHandling` to ensure consistent error handling
   - Let errors propagate to the API layer for proper status code assignment

3. **Database Access**:
   - Use `withConnection` for all database operations
   - Use lean queries when possible for better performance
   - Isolate database-specific code within service functions

4. **Formatting**:
   - Create helper functions for consistent data formatting
   - Keep transformations (like IDs and dates) within service layer

5. **Single Responsibility**:
   - Each service function should do one thing well
   - Break complex operations into smaller functions

6. **Documentation**:
   - Add JSDoc comments for parameters and return values
   - Document any side effects or important behaviors

## Organization

### By Feature

Organize service functions by feature area:

```
src/lib/services/
  ├── user-service.ts
  ├── auth-service.ts
  ├── analytics-service.ts
  └── notification-service.ts
```

### By Operation Type

For larger features, you can further organize by operation type:

```
src/lib/services/users/
  ├── queries.ts      // All read operations
  ├── commands.ts     // All write operations
  ├── calculations.ts // Business logic calculations
  └── helpers.ts      // Shared helper functions
```

## Testing

```typescript
// src/lib/services/__tests__/user-service.test.ts

import { getUserById } from '../user-service';
import { UserModel } from '@/models/user';
import mongoose from 'mongoose';

// Mock the Mongoose model
jest.mock('@/models/user');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return formatted user data when user exists', async () => {
      // Arrange
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        email: 'john@example.com',
        // ... other fields
      };
      
      // Setup mock
      (UserModel.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser)
        })
      });
      
      // Act
      const result = await getUserById(mockUser._id.toString());
      
      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(result).toEqual({
        id: mockUser._id.toString(),
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });
});
```

## Migrating Existing Code

When migrating existing code to this pattern:

1. Identify business logic in API routes
2. Extract into service functions
3. Update API routes to use service functions
4. Add unit tests for service functions
5. Ensure error handling is consistent

## Conclusion

Service functions provide a clean and maintainable way to organize business logic and data access. By following these patterns, we can improve code quality, testability, and maintainability without introducing unnecessary complexity.
