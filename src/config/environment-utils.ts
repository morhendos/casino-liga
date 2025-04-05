/**
 * Environment Variables Utilities
 * 
 * Provides functions for loading and validating environment variables.
 */

import { createLogger } from '@/lib/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'; // You'll need to install this package

// Initialize logger
const logger = createLogger('Env');

/**
 * Load environment variables from .env files with proper fallback hierarchy
 * 
 * Order of precedence:
 * 1. Process environment variables (already set)
 * 2. .env.local (overrides specific to this environment)
 * 3. .env.{NODE_ENV} (environment-specific defaults)
 * 4. .env (defaults)
 */
export function loadEnvVars(): void {
  try {
    // Check if we're in a Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      const rootDir = process.cwd();
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      logger.debug(`Loading environment variables for ${nodeEnv} environment`);
      
      // Define env files in order of priority (less important to more important)
      const envFiles = [
        path.resolve(rootDir, '.env'),
        path.resolve(rootDir, `.env.${nodeEnv}`),
        path.resolve(rootDir, '.env.local'),
      ];
      
      // Load each env file if it exists, with later files taking precedence
      for (const file of envFiles) {
        if (fs.existsSync(file)) {
          logger.debug(`Loading env file: ${path.basename(file)}`);
          const envConfig = dotenv.parse(fs.readFileSync(file));
          
          // Add any variables that aren't already defined in process.env
          for (const key in envConfig) {
            if (!process.env[key]) {
              process.env[key] = envConfig[key];
            }
          }
        }
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
          process.env.MONGODB_URI = 'mongodb://localhost:27017/casino_liga';
          logger.info('Using default MongoDB URI: mongodb://localhost:27017/casino_liga');
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
