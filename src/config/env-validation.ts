// src/config/env-validation.ts

import { createLogger } from '@/lib/logger';

// Initialize logger
const logger = createLogger('EnvValidation');

/**
 * Defines environment variable validation rules
 */
export interface EnvVarValidation {
  isRequired: boolean;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  defaultValue?: string;
}

/**
 * Environment variable configuration for the application
 */
export const ENV_CONFIG: Record<string, EnvVarValidation> = {
  // Database configuration
  MONGODB_URI: {
    isRequired: true,
    validate: (uri) => /^mongodb(\+srv)?:\/\/.+/.test(uri),
    errorMessage: 'MONGODB_URI must be a valid MongoDB connection string',
  },
  MONGODB_DATABASE: {
    isRequired: false,
    defaultValue: 'casino_liga',
  },
  
  // NextAuth configuration
  NEXTAUTH_SECRET: {
    isRequired: true,
    validate: (secret) => secret.length >= 32,
    errorMessage: 'NEXTAUTH_SECRET must be at least 32 characters long',
  },
  NEXTAUTH_URL: {
    isRequired: process.env.NODE_ENV === 'production',
    validate: (url) => /^https?:\/\/.+/.test(url),
    errorMessage: 'NEXTAUTH_URL must be a valid URL',
    defaultValue: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
  },
  
  // Feature flags
  ENABLE_MONITORING: {
    isRequired: false,
    validate: (value) => ['true', 'false'].includes(value.toLowerCase()),
    defaultValue: 'false',
  },
  USE_MOCK_DB: {
    isRequired: false,
    validate: (value) => ['true', 'false'].includes(value.toLowerCase()),
    defaultValue: 'false',
  },
};

/**
 * Validates environment variables according to the defined rules
 * @returns Object with validation results
 */
export function validateEnv(): { 
  isValid: boolean; 
  missingVars: string[]; 
  invalidVars: string[]; 
} {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];
  
  for (const [name, config] of Object.entries(ENV_CONFIG)) {
    const value = process.env[name];
    
    // Check if variable is required but missing
    if (config.isRequired && (!value || value.trim() === '')) {
      missingVars.push(name);
      continue;
    }
    
    // Apply default value if missing
    if ((!value || value.trim() === '') && config.defaultValue !== undefined) {
      process.env[name] = config.defaultValue;
      logger.debug(`Applied default value for ${name}`);
      continue;
    }
    
    // Validate value if validation function exists
    if (value && config.validate && !config.validate(value)) {
      invalidVars.push(name);
      logger.error(`Invalid value for ${name}: ${config.errorMessage}`);
    }
  }
  
  const isValid = missingVars.length === 0 && invalidVars.length === 0;
  
  return {
    isValid,
    missingVars,
    invalidVars,
  };
}

/**
 * Throws an error if environment variables are invalid
 * @param strict If true, throws error; if false, logs warnings in development
 */
export function enforceValidEnv(strict = process.env.NODE_ENV === 'production'): void {
  const { isValid, missingVars, invalidVars } = validateEnv();
  
  if (!isValid) {
    const errors = [
      ...missingVars.map(name => `Missing required environment variable: ${name}`),
      ...invalidVars.map(name => `Invalid environment variable: ${name} - ${ENV_CONFIG[name].errorMessage}`)
    ];
    
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
    
    if (strict) {
      throw new Error(errorMessage);
    } else {
      logger.warn(errorMessage);
      logger.warn('Continuing with default values in development mode');
    }
  }
}