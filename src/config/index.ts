// src/config/index.ts

import { loadEnvVars } from './environment-utils';
import { enforceValidEnv } from './env-validation';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AppInit');

/**
 * Initialize application configuration
 * This should be called early in the application lifecycle
 */
export function initializeConfig(): void {
  try {
    // Load environment variables from .env files
    loadEnvVars();
    
    // Validate environment variables and enforce requirements
    // This will throw in production if required variables are missing
    enforceValidEnv();
    
    logger.info(`Application initialized in ${process.env.NODE_ENV} environment`);
  } catch (error) {
    logger.error('Failed to initialize application configuration', error);
    
    // Re-throw in production to prevent the app from starting with invalid config
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Always initialize immediately
initializeConfig();

// Re-export environment utilities
export * from './environment-utils';
export * from './env-validation';
export * from './environment';
