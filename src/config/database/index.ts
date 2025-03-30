/**
 * Database Configuration Index
 * 
 * Re-exports all database configuration from appropriate modules
 * for convenient access throughout the application.
 */

// Export main configuration from config.ts
export * from './config';
export { default } from './config';

// Export database types
export * from './types';
