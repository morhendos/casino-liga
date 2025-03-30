/**
 * Environment Configuration Module
 * 
 * Centralizes environment variable handling, validation, and provides
 * type-safe access to configuration values across the application.
 */
import { createLogger } from '@/lib/logger';
import { loadEnvVars as loadVars, ensureEnvVars as checkVars } from './environment-utils';

// Re-export compatibility functions
export { loadEnvVars, ensureEnvVars } from './environment-utils';

// Initialize logger
const logger = createLogger('Env');

/**
 * Environment variable types
 */
export interface EnvironmentVars {
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Database configuration
  MONGODB_URI: string;
  MONGODB_DATABASE?: string;
  
  // Authentication configuration
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL?: string;
  
  // Feature flags
  ENABLE_MONITORING?: string;
  USE_MOCK_DB?: string;
  
  // Build configuration
  IS_BUILD_TIME?: string;
  NEXT_PHASE?: string;
}

/**
 * Default environment values for development
 */
const defaultEnvValues: Partial<EnvironmentVars> = {
  NODE_ENV: 'development',
  MONGODB_DATABASE: 'saas_db',
  ENABLE_MONITORING: 'false',
  USE_MOCK_DB: 'false',
};

/**
 * Environment detection helpers
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Build environment detection helpers
 */
export const isBuildTime = 
  // Check Next.js phase env var
  process.env.NEXT_PHASE?.includes('build') || 
  process.env.NEXT_PHASE === 'phase-export' || 
  // Check custom flag from next.config.js
  process.env.IS_BUILD_TIME === 'true';

export const isStaticGeneration = 
  isBuildTime || 
  typeof process !== 'undefined' && process.env.NEXT_PHASE !== undefined;

/**
 * Load environment variables with validation
 * 
 * @returns Environment variables with defaults applied
 */
export function loadEnv(): Partial<EnvironmentVars> {
  try {
    // Attempt to load .env if not already loaded
    loadVars();
    
    if (typeof process !== 'undefined' && process.env) {
      // Apply default values for missing variables
      Object.entries(defaultEnvValues).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });

      // Required variables in production
      if (isProduction) {
        // Ensure required variables are set
        checkVars();
      }

      // Validate development environment
      if (isDevelopment) {
        if (!process.env.MONGODB_URI) {
          logger.warn('MONGODB_URI not set, using default localhost connection');
          process.env.MONGODB_URI = 'mongodb://localhost:27017/saas_db';
        }
        
        if (!process.env.NEXTAUTH_SECRET) {
          logger.warn('NEXTAUTH_SECRET not set, using a temporary value for development');
          process.env.NEXTAUTH_SECRET = 'development-secret-value-do-not-use-in-production';
        }
      }

      // Log environment
      logger.debug(`Environment: ${process.env.NODE_ENV}`);
      
      return process.env as unknown as Partial<EnvironmentVars>;
    }
  } catch (error) {
    logger.error('Error loading environment variables:', error);
  }
  
  return {};
}

/**
 * Get the value of an environment variable with type safety
 * 
 * @param name Variable name
 * @param defaultValue Default value if not set
 * @returns Value or default
 */
export function getEnv<K extends keyof EnvironmentVars>(
  name: K, 
  defaultValue?: EnvironmentVars[K]
): EnvironmentVars[K] | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return (process.env[name as string] as EnvironmentVars[K]) || defaultValue;
  }
  return defaultValue;
}

/**
 * Verify that a required environment variable is set
 * 
 * @param name Variable name
 * @param errorMessage Optional custom error message
 * @returns Value if set
 * @throws Error if not set
 */
export function requireEnv<K extends keyof EnvironmentVars>(
  name: K,
  errorMessage?: string
): EnvironmentVars[K] {
  const value = getEnv(name);
  if (value === undefined || value === '') {
    throw new Error(errorMessage || `Required environment variable ${name} is not set`);
  }
  return value;
}

// Initialize environment
export default loadEnv();