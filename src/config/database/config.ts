/**
 * MongoDB Database Configuration
 * 
 * Central configuration for MongoDB database connections.
 */

import { 
  isDevelopment, 
  isProduction, 
  isTest,
  isBuildTime, 
  isStaticGeneration 
} from '../environment';

import configLoader from './loader';
import { MongoDBConfig } from './types';

// Re-export environment detection helpers
export { isDevelopment, isProduction, isTest, isBuildTime, isStaticGeneration };

// Export the core database configuration
export const dbConfig = {
  // Connection string
  uri: configLoader.uri,
  
  // Database name
  databaseName: configLoader.databaseName,
  
  // Connection pool settings
  maxPoolSize: configLoader.maxPoolSize,
  minPoolSize: configLoader.minPoolSize,
  
  // Timeouts
  connectionTimeoutMS: configLoader.connectionTimeoutMS,
  serverSelectionTimeoutMS: configLoader.serverSelectionTimeoutMS,
  socketTimeoutMS: configLoader.socketTimeoutMS,
  maxIdleTimeMS: configLoader.maxIdleTimeMS,
  
  // Retry settings
  maxRetries: configLoader.maxRetries,
  retryDelayMS: configLoader.retryDelayMS,
  
  // Read/Write preferences
  writeConcern: configLoader.writeConcern,
  readPreference: configLoader.readPreference,
  
  // Other settings
  autoIndex: configLoader.autoIndex,
  ssl: configLoader.ssl,
  authSource: configLoader.authSource,
  retryWrites: configLoader.retryWrites,
  retryReads: configLoader.retryReads,
  
  // Development options
  logOperations: configLoader.development.logOperations,
};

// Export monitoring configuration
export const monitoringConfig = {
  enabled: configLoader.monitoring.enabled,
  
  // Metrics
  metricsInterval: configLoader.monitoring.metricsIntervalSeconds,
  customMetrics: [
    'atlas.numberOfConnections',
    'atlas.opcounters',
    'atlas.memory',
    'atlas.network',
  ],
  
  // Alerts
  alerts: {
    queryPerformance: {
      enabled: configLoader.monitoring.alerts.queryPerformance.enabled,
      slowQueryThresholdMs: configLoader.monitoring.alerts.queryPerformance.slowQueryThresholdMs,
      aggregationThresholdMs: configLoader.monitoring.alerts.queryPerformance.aggregationThresholdMs,
    },
    connectionPool: {
      enabled: configLoader.monitoring.alerts.connectionPoolUtilization.enabled,
      threshold: configLoader.monitoring.alerts.connectionPoolUtilization.threshold,
      criticalThreshold: configLoader.monitoring.alerts.connectionPoolUtilization.criticalThreshold,
    },
    replication: {
      enabled: configLoader.monitoring.alerts.replication.enabled,
      maxLagSeconds: configLoader.monitoring.alerts.replication.maxLagSeconds,
    },
  },
  
  // Logging
  logging: {
    slowQueryThresholdMs: configLoader.monitoring.logging.slowQueryThresholdMs,
    rotationDays: configLoader.monitoring.logging.rotationDays,
    level: configLoader.monitoring.logging.level,
    mongoDBProfileLevel: configLoader.monitoring.logging.mongoDBProfileLevel,
  },
};

// Helper to check if we're in a build or static generation context
export const shouldUseMockDb = () => {
  // Always use mock DB during build or static generation
  if (isBuildTime || isStaticGeneration) {
    return true;
  }
  
  // Also use mock DB if explicitly set via environment variable
  if (process.env.USE_MOCK_DB === 'true') {
    return true;
  }
  
  return false;
};

// Export mongoose connection options generator
export const getMongooseOptions = () => {
  return {
    // Connection pool settings
    maxPoolSize: dbConfig.maxPoolSize,
    minPoolSize: dbConfig.minPoolSize,
    
    // Timeouts
    serverSelectionTimeoutMS: dbConfig.serverSelectionTimeoutMS,
    socketTimeoutMS: dbConfig.socketTimeoutMS,
    connectTimeoutMS: dbConfig.connectionTimeoutMS,
    maxIdleTimeMS: dbConfig.maxIdleTimeMS,
    
    // Read/write preferences
    writeConcern: {
      w: dbConfig.writeConcern,
      j: isProduction,
    },
    
    // Other settings
    autoIndex: dbConfig.autoIndex,
    retryWrites: dbConfig.retryWrites,
    retryReads: dbConfig.retryReads,
    ssl: dbConfig.ssl,
    authSource: dbConfig.authSource,
  };
};

// Export all configurations together for convenience
export default {
  dbConfig,
  monitoringConfig,
  isDevelopment,
  isProduction,
  isTest,
  isBuildTime,
  isStaticGeneration,
  shouldUseMockDb,
};
