/**
 * MongoDB Atlas Configuration Compatibility Module
 * 
 * This module provides backward compatibility for existing code
 * that imports from the old atlas-config.ts file.
 */

import { dbConfig, monitoringConfig } from '@/config/database';
import { isDevelopment, isProduction } from '@/config/environment';
import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('Atlas Config');

/**
 * Get MongoDB Atlas configuration for the specified environment
 * 
 * @param env - Environment ('development', 'production', 'test')
 * @returns MongoDB connection options
 */
export function getAtlasConfig(env?: string): Record<string, any> {
  logger.debug(`Getting Atlas config for environment: ${env || 'unknown'}`);

  // Use the environment-specific configuration values from database-config
  const config = {
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

  return config;
}

/**
 * Get monitoring configuration
 * 
 * @returns Monitoring configuration
 */
export function getMonitoringConfig(): Record<string, any> {
  return {
    metrics: {
      enabled: monitoringConfig.enabled,
      intervalSeconds: monitoringConfig.metricsInterval,
    },
    alerts: {
      queryPerformance: monitoringConfig.alerts.queryPerformance,
      connectionPoolUtilization: monitoringConfig.alerts.connectionPool,
      replication: monitoringConfig.alerts.replication,
    },
  };
}

// Export default for convenience
export default { getAtlasConfig, getMonitoringConfig };
