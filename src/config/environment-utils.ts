/**
 * Environment Variables Utilities
 * 
 * Provides functions for loading and validating environment variables.
 * This is a compatibility module to replace the old env-debug.ts file.
 */

import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('Env');

/**
 * Load environment variables from .env file
 * 
 * This is primarily for development and tests, as production
 * environments should have environment variables set directly.
 */
export function loadEnvVars(): void {
  try {
    // Check if we're in a Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      // In development mode, log that we're loading environment variables
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Loading environment variables');
      }
    }
  } catch (error) {
    logger.error('Error loading environment variables:', error);
  }
}

/**
 * Required environment variables for the application
 */
export const REQUIRED_ENV_VARS = {
  REQUIRED_IN_PRODUCTION: [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ],
  REQUIRED_IN_DEVELOPMENT: [
    'MONGODB_URI',
    'NEXTAUTH_SECRET'
  ]
};

/**
 * Ensure that all required environment variables are set
 * 
 * @throws Error if any required environment variables are missing
 */
export function ensureEnvVars(): void {
  try {
    if (typeof process === 'undefined' || !process.env) {
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Determine which variables to check based on environment
    const varsToCheck = isProduction 
      ? REQUIRED_ENV_VARS.REQUIRED_IN_PRODUCTION
      : isDevelopment 
        ? REQUIRED_ENV_VARS.REQUIRED_IN_DEVELOPMENT
        : [];
    
    // Find missing variables
    const missing = varsToCheck.filter(name => !process.env[name]);
    
    if (missing.length > 0) {
      const missingList = missing.join(', ');
      logger.error(`Missing required environment variables: ${missingList}`);
      
      // In development, warn instead of throwing
      if (isDevelopment) {
        logger.warn('Some environment variables are missing, but continuing in development mode');
        
        // Provide fallbacks for common variables in development
        if (!process.env.MONGODB_URI) {
          process.env.MONGODB_URI = 'mongodb://localhost:27017/saas_db';
          logger.info('Using default MongoDB URI: mongodb://localhost:27017/saas_db');
        }
        
        if (!process.env.NEXTAUTH_SECRET) {
          process.env.NEXTAUTH_SECRET = 'development-secret-not-for-production';
          logger.warn('Using insecure NEXTAUTH_SECRET for development');
        }
      } else if (isProduction) {
        // In production, throw an error
        throw new Error(`Missing required environment variables: ${missingList}`);
      }
    }
  } catch (error) {
    logger.error('Error checking environment variables:', error);
    throw error;
  }
}
