/**
 * MongoDB Connection Test
 *
 * Tests connection to MongoDB server and provides detailed diagnostics.
 * Uses the simplified connection approach which is the recommended
 * method throughout the application.
 */
import mongoose from 'mongoose';
import { getConnection } from './simplified-connection';
import { createLogger } from '@/lib/logger';

// Create a dedicated logger for the test
const logger = createLogger('Connection Test');

async function testConnection() {
  logger.info("Testing MongoDB connection...");

  try {
    const connection = await getConnection();
    logger.info("Connection successful!");

    // Get server info
    try {
      // Check if connection.db exists before using it
      if (!connection.db) {
        throw new Error(
          "Database connection not fully established (connection.db is undefined)"
        );
      }

      const adminDb = connection.db.admin();
      const serverInfo = await adminDb.serverStatus();

      logger.info("\nServer information:");
      logger.info(`- MongoDB version: ${serverInfo.version}`);
      logger.info(
        `- Uptime: ${(serverInfo.uptime / 60 / 60).toFixed(2)} hours`
      );
      logger.info(
        `- Connections: ${serverInfo.connections.current} (current) / ${serverInfo.connections.available} (available)`
      );

      // List databases
      const dbInfo = await adminDb.listDatabases();
      logger.info("\nDatabases:");
      dbInfo.databases.forEach((db: any) => {
        logger.info(
          `- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`
        );
      });

      // Check if our database exists
      const dbName = process.env.MONGODB_DATABASE || "saas_db";
      const dbExists = dbInfo.databases.some((db: any) => db.name === dbName);
      if (!dbExists) {
        logger.info(
          `\nNote: The '${dbName}' database doesn't exist yet. It will be created when data is first inserted.`
        );
      } else {
        // List collections in our database
        const db = connection.db;
        const collections = await db.listCollections().toArray();

        logger.info(`\nCollections in '${dbName}' database:`);
        if (collections.length === 0) {
          logger.info("- No collections found");
        } else {
          collections.forEach((collection: any) => {
            logger.info(`- ${collection.name}`);
          });
        }
      }
    } catch (error) {
      logger.warn("Could not retrieve detailed server information:", error);
    }

    // Disconnect manually for the test
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info("Disconnected successfully");
    }
    
    logger.info("\nConnection test completed successfully!");
  } catch (error) {
    logger.error("Connection failed:", error);
  }
}

testConnection();
