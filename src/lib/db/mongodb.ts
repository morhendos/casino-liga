/**
 * Advanced MongoDB Connection and Monitoring Module
 *
 * IMPORTANT USAGE NOTE:
 * ---------------------
 * THIS MODULE SHOULD ONLY BE USED FOR:
 * 1. Advanced monitoring and health checks in production environments
 * 2. Database administration tasks
 * 3. The database health API endpoint
 *
 * For regular application database access, use the simplified connection approach:
 * import { withConnection, getConnection } from '@/lib/db';
 *
 * This module provides MongoDB connection functionality with advanced features like
 * retry mechanisms, Atlas monitoring, and health checks that are unnecessary for
 * regular application code.
 *
 * RELATIONSHIP TO SIMPLIFIED-CONNECTION.TS:
 * -----------------------------------------
 * - simplified-connection.ts: Used for normal application database access
 * - mongodb.ts (this file): Used for monitoring, health checks, and diagnostics
 *
 * The application has been refactored to consolidate connection logic in the
 * simplified-connection.ts module, but this file is maintained for specialized use cases.
 */

import mongoose from "mongoose";
import { getAtlasConfig, getMonitoringConfig } from "./atlas-config";
import {
  validateMongoURI,
  getSanitizedURI,
  normalizeMongoURI,
  isLocalConnection,
} from "@/utils/mongodb-utils";
import { monitoring } from "@/lib/monitoring";
import { loadEnvVars, ensureEnvVars } from "@/config/environment";
import { createLogger } from "@/lib/logger";

// Initialize logger
const logger = createLogger("MongoDB Atlas");

// Load environment variables if they're not already available
if (!process.env.MONGODB_URI) {
  logger.info("MONGODB_URI not found in environment, attempting to load...");
  loadEnvVars();
  ensureEnvVars();
}

interface GlobalMongoose {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

// Constants for retry mechanism
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const isDev = process.env.NODE_ENV === "development";

class MongoConnectionError extends Error {
  constructor(message: string, public readonly retryCount: number) {
    super(message);
    this.name = "MongoConnectionError";
  }
}

// Initialize cached connection with strong typing
const cached: GlobalMongoose = global.mongoose ?? { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

// Helper function to delay execution with exponential backoff
const delay = (retryCount: number) =>
  new Promise((resolve) =>
    setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retryCount))
  );

// Validate environment variables
const validateEnv = () => {
  // Double-check environment variables are loaded
  if (!process.env.MONGODB_URI) {
    logger.error("MONGODB_URI still not found after loading attempts");

    // In development mode, use a fallback value as a last resort
    if (isDev) {
      logger.warn("Using fallback connection string for development");
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/saas_db";
    } else {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
  }

  if (!validateMongoURI(process.env.MONGODB_URI)) {
    throw new Error("MONGODB_URI environment variable is invalid");
  }
};

// Enhanced monitoring setup for Atlas
const setupMonitoring = (connection: mongoose.Connection) => {
  const config = getMonitoringConfig();
  const metricsInterval = config.metrics.intervalSeconds * 1000;

  if (config.metrics.enabled) {
    // Command monitoring with detailed performance tracking
    connection.on("commandStarted", (event) => {
      const monitoredCommands = [
        "find",
        "insert",
        "update",
        "delete",
        "aggregate",
      ];
      if (monitoredCommands.includes(event.commandName)) {
        monitoring.info(`Command ${event.commandName} started`, {
          namespace: event.databaseName,
          commandName: event.commandName,
          timestamp: new Date().toISOString(),
        });
      }
    });

    connection.on("commandSucceeded", (event) => {
      const monitoredCommands = [
        "find",
        "insert",
        "update",
        "delete",
        "aggregate",
      ];
      if (monitoredCommands.includes(event.commandName)) {
        const latency = event.duration;
        monitoring.info(`Command ${event.commandName} succeeded`, {
          duration: latency,
          timestamp: new Date().toISOString(),
        });

        const threshold =
          event.commandName === "aggregate"
            ? config.alerts.queryPerformance.aggregationThresholdMs
            : config.alerts.queryPerformance.slowQueryThresholdMs;

        if (latency > threshold) {
          monitoring.warn(`Slow ${event.commandName} detected`, {
            duration: latency,
            threshold,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    connection.on("commandFailed", (event) => {
      monitoring.error(`Command ${event.commandName} failed`, {
        error: event.failure,
        timestamp: new Date().toISOString(),
      });
    });
  }

  // Enhanced performance monitoring for Atlas
  if (config.alerts.queryPerformance.enabled) {
    const db = connection.db;

    if (db) {
      setInterval(async () => {
        try {
          const adminDb = db.admin();
          const [serverStatus, replSetStatus] = await Promise.all([
            adminDb.serverStatus(),
            adminDb.command({ replSetGetStatus: 1 }).catch(() => null),
          ]);

          const metrics = {
            connections: {
              current: serverStatus.connections.current,
              available: serverStatus.connections.available,
              utilizationPercentage:
                (serverStatus.connections.current /
                  serverStatus.connections.available) *
                100,
            },
            opcounters: serverStatus.opcounters,
            network: serverStatus.network,
            memory: serverStatus.mem,
            replication: replSetStatus
              ? {
                  lag: replSetStatus.members
                    .filter((m: any) => !m.self)
                    .map((m: any) => m.optimeDate),
                  status: replSetStatus.members.map((m: any) => ({
                    name: m.name,
                    state: m.stateStr,
                    health: m.health,
                  })),
                }
              : null,
          };

          // Check thresholds and alert if necessary
          if (
            metrics.connections.utilizationPercentage >
            config.alerts.connectionPoolUtilization.threshold
          ) {
            monitoring.warn("High connection pool utilization", {
              utilization: metrics.connections.utilizationPercentage,
              threshold: config.alerts.connectionPoolUtilization.threshold,
              timestamp: new Date().toISOString(),
            });
          }

          if (replSetStatus && config.alerts.replication.enabled) {
            const maxLag = Math.max(...metrics.replication!.lag);
            if (maxLag > config.alerts.replication.maxLagSeconds * 1000) {
              monitoring.warn("High replication lag detected", {
                lag: maxLag,
                threshold: config.alerts.replication.maxLagSeconds * 1000,
                timestamp: new Date().toISOString(),
              });
            }
          }

          // Store metrics for health checks
          (global as any).mongoMetrics = metrics;
        } catch (error) {
          monitoring.error("Failed to collect metrics", { error });
        }
      }, metricsInterval);
    }
  }
};

// Connect to MongoDB with retry mechanism
async function connectWithRetry(retryCount = 0): Promise<mongoose.Connection> {
  try {
    validateEnv();

    const uri = process.env.MONGODB_URI as string;
    const dbName = process.env.MONGODB_DATABASE || "saas_db";

    // Normalize the URI to ensure it has a valid database name
    const normalizedUri = normalizeMongoURI(uri, dbName);

    isDev &&
      logger.info("Connecting to:", {
        uri: getSanitizedURI(normalizedUri),
        database: dbName,
      });

    const atlasConfig = getAtlasConfig(process.env.NODE_ENV);
    const connection = await mongoose.connect(normalizedUri, atlasConfig);
    isDev && logger.info("Connected successfully");

    // Set up connection monitoring
    connection.connection.on("disconnected", () => {
      logger.warn("Disconnected. Attempting to reconnect...");
    });

    connection.connection.on("reconnected", () => {
      logger.info("Reconnected successfully");
    });

    connection.connection.on("error", (err) => {
      logger.error("Connection error:", { error: err });
    });

    // Setup monitoring in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.ENABLE_MONITORING === "true"
    ) {
      setupMonitoring(connection.connection);
    }

    return connection.connection;
  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      logger.warn(`Connection attempt ${retryCount + 1} failed. Retrying...`, {
        error: error.message,
        retryCount,
        nextRetryIn: RETRY_DELAY_MS * Math.pow(2, retryCount),
      });

      await delay(retryCount);
      return connectWithRetry(retryCount + 1);
    }

    throw new MongoConnectionError(
      `Failed to connect to MongoDB Atlas after ${MAX_RETRIES} attempts: ${error.message}`,
      retryCount
    );
  }
}

/**
 * Connect to MongoDB with advanced monitoring and retry mechanisms
 *
 * NOTE: This should only be used for specialized cases like health checks or monitoring.
 * For normal application database access, use the simplified connection approach instead.
 *
 * @returns A Promise resolving to a mongoose Connection
 */
export async function connectToDatabase(): Promise<mongoose.Connection> {
  if (cached.conn) {
    isDev && logger.info("Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry().catch((error) => {
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    throw error;
  }
}

// Disconnect function with proper cleanup
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    try {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      isDev && logger.info("Disconnected successfully");
      // Clear stored metrics
      (global as any).mongoMetrics = null;
    } catch (error: any) {
      logger.error("Disconnect error:", { error: error.message });
      throw error;
    }
  }
}

/**
 * Performs advanced health check for MongoDB connection
 *
 * This function is primarily intended for the health API endpoint
 * that reports database status to monitoring systems.
 *
 * @returns Health check result with detailed metrics
 */
export async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "unhealthy";
  latency: number;
  metrics?: {
    connections: {
      current: number;
      available: number;
      utilizationPercentage: number;
    };
    opcounters?: {
      insert: number;
      query: number;
      update: number;
      delete: number;
      getmore: number;
      command: number;
    };
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
}> {
  const startTime = Date.now();

  try {
    const conn = mongoose.connection;

    if (!conn.db) {
      throw new Error("Database connection not established");
    }

    const adminDb = conn.db.admin();

    // Execute checks in parallel
    const [ping, serverStatus, replSetStatus] = await Promise.all([
      adminDb.ping(),
      adminDb.serverStatus(),
      adminDb.command({ replSetGetStatus: 1 }).catch(() => null),
    ]);

    if (!ping.ok) {
      throw new Error("Database ping failed");
    }

    const latency = Date.now() - startTime;
    const cachedMetrics = (global as any).mongoMetrics;

    const response = {
      status: "healthy" as const,
      latency,
      timestamp: new Date().toISOString(),
      metrics: {
        connections: {
          current: serverStatus.connections.current,
          available: serverStatus.connections.available,
          utilizationPercentage:
            (serverStatus.connections.current /
              serverStatus.connections.available) *
            100,
        },
        opcounters: serverStatus.opcounters,
        ...cachedMetrics,
      },
      message: "Database is responding normally",
    };

    // Add replication metrics if available
    if (replSetStatus) {
      const replicationMetrics = {
        status: replSetStatus.members.map((m: any) => ({
          name: m.name,
          state: m.stateStr,
          health: m.health,
        })),
        maxLagMs: Math.max(
          ...replSetStatus.members
            .filter((m: any) => !m.self)
            .map((m: any) => m.optimeDate)
        ),
      };

      response.metrics.replication = replicationMetrics;
    }

    return response;
  } catch (error: any) {
    const errorResponse = {
      status: "unhealthy" as const,
      latency: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      message: `Database health check failed: ${error.message}`,
    };

    logger.error("Health check failed", {
      error: error.message,
      latency: errorResponse.latency,
    });

    return errorResponse;
  }
}
