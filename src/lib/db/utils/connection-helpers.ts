/**
 * Database Connection Helper Utilities
 * 
 * Helper functions for managing database connections
 * and handling common connection-related operations.
 */

import mongoose from 'mongoose';
import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('DB Utils');

/**
 * Create a model with proper error handling for re-use
 * 
 * @param name Model name
 * @param schema Mongoose schema
 * @returns MongoDB model
 */
export function createModel<T>(name: string, schema: mongoose.Schema): mongoose.Model<T> {
  try {
    // Try to get the model if it's already registered
    return mongoose.models[name] as mongoose.Model<T> || 
      mongoose.model<T>(name, schema);
  } catch (error: unknown) {
    // If the model is already registered, return it
    if (error instanceof Error && error.name === 'OverwriteModelError') {
      return mongoose.model<T>(name);
    }
    throw error;
  }
}

/**
 * Check if a connection is healthy
 * 
 * @param connection MongoDB connection to check
 * @returns True if connection is healthy
 */
export async function isConnectionHealthy(connection?: mongoose.Connection): Promise<boolean> {
  const conn = connection || mongoose.connection;
  
  // Check if connection is established
  if (!conn || conn.readyState !== 1) {
    return false;
  }
  
  try {
    // Check if connection is responsive
    if (!conn.db) {
      return false;
    }
    
    // Ping the database
    const pingResult = await conn.db.admin().ping();
    return pingResult.ok === 1;
  } catch (error) {
    logger.error('Connection health check failed:', error);
    return false;
  }
}

/**
 * Get a human-readable description of a connection ready state
 * 
 * @param readyState Mongoose connection ready state number
 * @returns Human-readable description
 */
export function getReadyStateDescription(readyState: number): string {
  switch (readyState) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    case 99: return 'uninitialized';
    default: return `unknown (${readyState})`;
  }
}

/**
 * Get database metrics from a connection
 * 
 * @param connection MongoDB connection
 * @returns Database metrics object
 */
export async function getConnectionMetrics(connection?: mongoose.Connection): Promise<Record<string, any> | null> {
  const conn = connection || mongoose.connection;
  
  // Check if connection is established
  if (!conn || conn.readyState !== 1 || !conn.db) {
    return null;
  }
  
  try {
    // Get server status
    const adminDb = conn.db.admin();
    const serverStatus = await adminDb.serverStatus();
    
    return {
      connections: {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        utilizationPercentage: (serverStatus.connections.current / serverStatus.connections.available) * 100
      },
      opcounters: serverStatus.opcounters,
      network: serverStatus.network,
      memory: serverStatus.mem,
    };
  } catch (error) {
    logger.error('Failed to get connection metrics:', error);
    return null;
  }
}
