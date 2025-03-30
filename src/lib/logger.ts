/**
 * Unified Logger Module
 * 
 * Provides a consistent interface for logging throughout the application.
 * Supports different log levels and formats.
 */

// Standard Logger interface
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Basic console implementation
export class ConsoleLogger implements Logger {
  constructor(private prefix: string = '') {}

  debug(message: string, ...args: any[]): void {
    console.debug(this.formatMessage(message), ...args);
  }
  
  info(message: string, ...args: any[]): void {
    console.info(this.formatMessage(message), ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage(message), ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage(message), ...args);
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }
}

// Environment-aware logger that can be silenced in production
export class EnvironmentLogger implements Logger {
  private isDev: boolean;
  private logger: Logger;

  constructor(prefix: string = '') {
    this.isDev = process.env.NODE_ENV === 'development';
    this.logger = new ConsoleLogger(prefix);
  }

  debug(message: string, ...args: any[]): void {
    // Only log debug messages in development
    if (this.isDev) {
      this.logger.debug(message, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }
}

// Factory function to create a logger with a specific prefix
export function createLogger(prefix: string): Logger {
  return new EnvironmentLogger(prefix);
}

// Default export for convenience
export default createLogger;

// Default logger instance
export const logger = createLogger('App');
