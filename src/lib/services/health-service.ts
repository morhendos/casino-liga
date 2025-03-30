/**
 * Health Service
 * 
 * This module provides service functions for health check operations.
 * It centralizes health check logic for database and system components.
 */

import { withErrorHandling } from '@/lib/db/unified-error-handler';
import { checkDatabaseHealth } from '@/lib/db/mongodb';
import mongoose from 'mongoose';

/**
 * Health status response type
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  details?: any;
  timestamp: string;
}

/**
 * Database health response type
 */
export interface DatabaseHealthResponse extends HealthStatus {
  connection: {
    latency: number;
    readyState: string;
  };
}

/**
 * System health response type
 */
export interface SystemHealthResponse extends HealthStatus {
  database: {
    status: 'healthy' | 'unhealthy' | 'error';
    error?: string;
  };
  schemas: {
    collections: string[];
  };
}

/**
 * Helper function to get human-readable connection state
 */
function getReadyStateDescription(readyState: number): string {
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
 * Get database health status
 * 
 * @returns Database health information
 */
export async function getDatabaseHealth(): Promise<DatabaseHealthResponse> {
  return withErrorHandling(async () => {
    const startTime = Date.now();
    const conn = mongoose.connection;
    
    // Basic health check using mongoose connection
    let status: 'healthy' | 'unhealthy' = 'unhealthy';
    let details: any = { readyState: 'unknown' };
    
    if (conn && conn.readyState === 1) {
      try {
        // Check if db is defined before using it
        if (!conn.db) {
          throw new Error("Database connection not fully established");
        }
        
        // Check if we can ping the database
        await conn.db.admin().ping();
        status = 'healthy';
        details = {
          readyState: getReadyStateDescription(conn.readyState),
          databaseName: conn.db.databaseName
        };
      } catch (error) {
        status = 'unhealthy';
        details = {
          readyState: getReadyStateDescription(conn.readyState),
          error: error instanceof Error ? error.message : String(error)
        };
      }
    } else if (conn) {
      details = {
        readyState: getReadyStateDescription(conn.readyState),
        message: 'Connection not ready'
      };
    }
    
    const latency = Date.now() - startTime;
    
    // Return health status with connection details
    return {
      status,
      connection: {
        latency,
        readyState: details.readyState
      },
      details,
      timestamp: new Date().toISOString(),
    };
  }, 'getDatabaseHealth');
}

/**
 * Get overall system health status
 * 
 * @returns System health information
 */
export async function getSystemHealth(): Promise<SystemHealthResponse> {
  return withErrorHandling(async () => {
    // Check basic database health
    const health = await checkDatabaseHealth();
    
    // Initialize schema health information
    const schemaHealth = {
      collections: [] as string[]
    };

    // If database is connected, check collections
    if (health.status === 'healthy' && 
        mongoose.connection.readyState === 1 && // 1 = connected
        mongoose.connection.db) {
      try {
        const collections = await mongoose.connection.db.collections();
        schemaHealth.collections = collections.map(col => col.collectionName);
      } catch (collectionError) {
        console.warn('[Health Check] Error fetching collections:', collectionError);
        // Continue without collections data rather than failing completely
      }
    }

    // Return complete health status with required database property
    return {
      status: health.status,
      latency: health.latency,
      database: {
        status: health.status,
        // Only include error property if status is unhealthy
        ...(health.status === 'unhealthy' ? { error: 'Database connection issue detected' } : {})
      },
      schemas: schemaHealth,
      timestamp: new Date().toISOString()
    };
  }, 'getSystemHealth');
}