/**
 * Database Configuration Types
 * 
 * This module defines TypeScript interfaces for database configuration.
 */

import { ReadPreferenceMode } from 'mongodb';

// Supported write concern types
export type WriteConcern = number | 'majority';
export type MongoCompressor = 'none' | 'snappy' | 'zlib' | 'zstd';

/**
 * MongoDB Configuration Interface
 */
export interface MongoDBConfig {
  // Connection details
  uri: string;
  databaseName: string;
  
  // Connection pool settings
  maxPoolSize: number;
  minPoolSize: number;
  
  // Timeouts
  connectionTimeoutMS: number;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  maxIdleTimeMS: number;
  
  // Retry settings
  maxRetries: number;
  retryDelayMS: number;
  
  // Read/Write preferences
  writeConcern: WriteConcern;
  readPreference: ReadPreferenceMode;
  
  // Other settings
  autoIndex: boolean;
  autoCreate: boolean;
  ssl: boolean;
  authSource: string;
  retryWrites: boolean;
  retryReads: boolean;
  compressors?: MongoCompressor[];
  
  // Monitoring settings
  monitoring: {
    enabled: boolean;
    metricsIntervalSeconds: number;
    
    // Alerts
    alerts: {
      queryPerformance: {
        enabled: boolean;
        slowQueryThresholdMs: number;
        aggregationThresholdMs: number;
      };
      connectionPoolUtilization: {
        enabled: boolean;
        threshold: number;
        criticalThreshold: number;
      };
      replication: {
        enabled: boolean;
        maxLagSeconds: number;
      };
    };
    
    // Logging
    logging: {
      slowQueryThresholdMs: number;
      rotationDays: number;
      level: 'error' | 'warn' | 'info' | 'debug';
      mongoDBProfileLevel: 0 | 1 | 2;
    };
  };
  
  // Development-specific settings
  development: {
    logOperations: boolean;
  };
}

/**
 * Database Connection Options
 */
export interface ConnectionOptions {
  // Whether to use a direct (non-pooled) connection
  direct?: boolean;
  
  // Database name to use
  dbName?: string;
  
  // Custom connection timeout in milliseconds
  timeoutMS?: number;
  
  // Custom server selection timeout in milliseconds
  serverSelectionTimeoutMS?: number;
  
  // Whether to enable debugging
  debug?: boolean;
  
  // Auto-reconnect policy
  autoReconnect?: boolean;
  
  // Maximum number of reconnect attempts
  maxReconnectAttempts?: number;

  // Force the use of a mock connection
  forceMock?: boolean;
}

/**
 * Database Health Status Response
 */
export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy';
  latency: number;
  metrics?: {
    connections?: {
      current: number;
      available: number;
      utilizationPercentage: number;
    };
    opcounters?: Record<string, number>;
    replication?: {
      status: Array<{
        name: string;
        state: string;
        health: number;
      }>;
      maxLagMs?: number;
    };
  };
  message?: string;
  timestamp: string;
}
