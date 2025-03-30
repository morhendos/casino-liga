# Database Module Documentation

This document provides detailed information about the database module architecture, connection strategies, and best practices for working with MongoDB in the application.

## Connection Approaches

The database module offers two connection approaches:

### 1. Simplified Connection (Recommended for Application Code)

The simplified connection approach provides a clean, reliable connection pattern suitable for most application code. It ensures a single persistent connection and properly handles reconnection.

```typescript
// Import from the db index
import { getConnection, withConnection } from '@/lib/db';

// Example 1: Using withConnection
async function getUserData() {
  return await withConnection(async () => {
    // Connection is guaranteed to exist here
    const User = mongoose.model('User', userSchema);
    return await User.find({});
  });
}

// Example 2: Using getConnection directly
async function createUser(userData) {
  const conn = await getConnection();
  const User = mongoose.model('User', userSchema);
  return await User.create(userData);
}
```

### 2. Advanced Connection (For Monitoring and Health Checks)

The advanced connection in `mongodb.ts` provides additional features like connection retries, detailed metrics collection, and comprehensive health checks. It should only be used for:

- Health check API endpoints
- Monitoring and metrics collection
- Database administration tasks

```typescript
// Only import for specialized use cases
import { connectToDatabase, checkDatabaseHealth } from '@/lib/db/mongodb';

// Health API example
async function healthCheck() {
  return await checkDatabaseHealth();
}
```

## Utilities

### MongoDB URI Handling

The module provides utilities for working with MongoDB connection strings:

```typescript
import { normalizeMongoURI, validateMongoURI } from '@/utils/mongodb-uri';

// Ensure the URI includes the correct database name
const normalizedUri = normalizeMongoURI('mongodb://localhost:27017', 'my_db');

// Validate a MongoDB URI
const isValid = validateMongoURI(process.env.MONGODB_URI);
```

### Database Error Handling

The module includes standardized error handlers:

```typescript
import { handleDatabaseError } from '@/lib/db';

try {
  // Database operations
} catch (error) {
  // Standardized error handling
  return handleDatabaseError(error, 'Failed to fetch user data');
}
```

## Models

Models are defined in the `src/models` directory. All models should include proper TypeScript interfaces and validation.

Example:

```typescript
// src/models/user.ts
import mongoose from 'mongoose';
import { createModel, toJSON } from '@/lib/db';
import { User, UserModel } from '@/types/user';

const userSchema = new mongoose.Schema<User>({
  // Schema definition
});

// Apply shared plugins and configuration
userSchema.plugin(toJSON);

export default createModel<User, UserModel>('User', userSchema);
```

## Best Practices

1. **Always use the simplified connection approach** for normal application code
2. **Handle database errors consistently** using the provided error handlers
3. **Use proper TypeScript types** for all database models and operations
4. **Don't mix connection strategies** - choose either simplified or advanced based on the use case
5. **Leverage the withConnection pattern** for operations that need to ensure a connection exists
6. **Avoid manual disconnection** in application code - the connection manager handles this
7. **Use JSON serialization utilities** for consistent document transformation

## Environment Configuration

Database configuration is controlled through environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/saas_db |
| MONGODB_DATABASE | Database name | saas_db |
| ENABLE_MONITORING | Enable performance monitoring | false |
| USE_MOCK_DB | Use mock database for testing | false |

## Architecture Overview

The database module consists of several components:

- **Connection Management**
  - `simplified-connection.ts` - Primary connection handler for application code
  - `mongodb.ts` - Advanced connection with monitoring for specialized use cases

- **Utilities**
  - `utils/` - Serialization and helper functions
  - `error-handler.ts` - Standardized error handling
  - `unified-error-handler.ts` - Enhanced error handling with logging

- **Configuration**
  - `config/database/` - Database configuration
  - `utils/mongodb-uri.ts` - URI handling and validation

## Testing

The database module includes test utilities:

- `test-connection.ts` - Test and diagnose MongoDB connectivity
- `mock-connection.ts` - In-memory MongoDB for tests (when USE_MOCK_DB=true)

## Health Checks

Database health can be monitored through the health API:

```typescript
// Example health check API route
import { checkDatabaseHealth } from '@/lib/db/mongodb';

export async function GET() {
  const healthStatus = await checkDatabaseHealth();
  return Response.json(healthStatus, {
    status: healthStatus.status === 'healthy' ? 200 : 503
  });
}
```

## Performance Considerations

- Use proper indexes for frequently queried fields
- Leverage the MongoDB aggregation pipeline for complex queries
- Consider using projection to limit returned fields
- Be mindful of connection pool size in production environments

## Migration from Old Connection Pattern

If you find code still using the old connection pattern:

```typescript
// Old pattern (not recommended)
import { connectToDatabase } from '@/lib/db/mongodb';

const connection = await connectToDatabase();
// Do something with connection
```

Replace with:

```typescript
// New pattern (recommended)
import { withConnection } from '@/lib/db';

await withConnection(async () => {
  // Do database operations here
});
```

## Troubleshooting

Common issues and their solutions:

1. **Connection timeout errors**
   - Check firewall settings
   - Verify MongoDB is running
   - Ensure MONGODB_URI is correct

2. **Authentication errors**
   - Verify credentials in connection string
   - Check database user permissions

3. **Slow queries**
   - Check for missing indexes
   - Review query patterns
   - Consider using the MongoDB profiler

4. **Memory issues**
   - Check for large document creation
   - Look for missing cursor closure
   - Monitor connection leaks
