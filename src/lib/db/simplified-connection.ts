/**
 * Simplified MongoDB Connection Manager
 *
 * This module provides a reliable, persistent connection to MongoDB
 * using a singleton pattern to prevent premature disconnections.
 */

import mongoose from "mongoose";
import { normalizeMongoURI } from "@/utils/mongodb-utils";
import { createLogger } from "@/lib/logger";
import { getReadyStateDescription } from "./utils/connection-helpers";

// Global connection state
let connection: mongoose.Connection | null = null;
let connectionPromise: Promise<mongoose.Connection> | null = null;

// Database logger instance
const dbLogger = createLogger("DB");

/**
 * Get a MongoDB connection, reusing an existing one if available
 */
export async function getConnection(): Promise<mongoose.Connection> {
  // If we already have a valid connection, return it
  if (connection && connection.readyState === 1) {
    return connection;
  }

  // If a connection attempt is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Get MongoDB URI from environment
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/saas_db";

  // Normalize the URI to ensure correct database name
  const normalizedUri = normalizeMongoURI(uri);

  // Start a new connection
  connectionPromise = mongoose
    .connect(normalizedUri)
    .then(() => {
      connection = mongoose.connection;

      // Log database name for debugging - use optional chaining to avoid TypeScript errors
      dbLogger.info(
        `Connected to database: ${connection?.db?.databaseName || "unknown"}`
      );
      dbLogger.debug(
        `Connection state: ${getReadyStateDescription(connection.readyState)}`
      );

      // Listen for disconnect events
      connection.on("disconnected", () => {
        dbLogger.warn("MongoDB disconnected");
        connection = null;
      });

      connection.on("error", (err) => {
        dbLogger.error("MongoDB connection error:", err);
        connection = null;
      });

      return connection;
    })
    .catch((err) => {
      dbLogger.error("MongoDB connection error:", err);
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

/**
 * Run an operation with a MongoDB connection
 *
 * @param operation Function that performs database operations
 * @returns Result of the operation
 */
export async function withConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  // Get a connection first
  await getConnection();

  // Now run the operation
  return await operation();
}
