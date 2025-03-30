/**
 * Database Module
 * 
 * Serves as the entry point for database operations, exposing a clean API
 * for the rest of the application to use.
 * 
 * Connection Strategy:
 * This module uses the simplified-connection.ts module as the primary means
 * of connecting to MongoDB. This approach ensures a single, reliable connection
 * is maintained throughout the application's lifetime.
 */

// Import mongoose for direct access
import mongoose from 'mongoose';

// Export simplified connection utilities - our preferred approach
import { withConnection, getConnection as getSimplifiedConnection } from './simplified-connection';
export { withConnection };

// Export database utilities
import { safeSerialize, toJSON, toObject, createModel } from './utils';
export { safeSerialize, toJSON, toObject, createModel };

// Export error handling utilities
export * from './error-handler';
export * from './unified-error-handler';

// Re-export useful types
export { Connection } from 'mongoose';

// Use the shared logger
import { createLogger } from '@/lib/logger';

// Database logger instance
const dbLogger = createLogger('DB');

/**
 * Get a MongoDB connection (simplified method)
 * 
 * @param options Connection options (ignored, kept for backward compatibility)
 * @returns A Promise resolving to a Connection
 */
export const getConnection = async (options: any = {}) => {
  return getSimplifiedConnection();
};

/**
 * Disconnect all MongoDB connections
 * 
 * @returns A Promise that resolves when disconnection is complete
 */
export const disconnectAll = async () => {
  try {
    if (mongoose && mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      dbLogger.info('All connections closed');
    }
  } catch (error) {
    dbLogger.error('Error disconnecting all connections:', error);
  }
};

// Export for backward compatibility
export { createLogger };
