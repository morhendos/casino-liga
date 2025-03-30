/**
 * Environment Check Script
 *
 * This script provides a CLI utility to check the environment configuration
 * and validate that all required environment variables are set.
 *
 * Usage: npm run check:env
 */

import { loadEnv, requireEnv, getEnv } from "./environment";
import { createLogger } from "@/lib/logger";
import { validateMongoURI, getSanitizedURI } from "@/utils/mongodb-utils";

// Create dedicated logger
const logger = createLogger("Environment Check");

/**
 * Main check function
 */
async function checkEnvironment() {
  logger.info("Checking environment configuration...");

  try {
    // Load environment variables
    const env = loadEnv();

    // Log the Node environment
    const nodeEnv = getEnv("NODE_ENV");
    logger.info(`Running in ${nodeEnv || "unknown"} environment`);

    // Check MongoDB connection URI
    try {
      const mongoUri = getEnv("MONGODB_URI");
      if (mongoUri) {
        const isValid = validateMongoURI(mongoUri);
        if (isValid) {
          logger.info(`MongoDB URI is valid: ${getSanitizedURI(mongoUri)}`);
        } else {
          logger.error(`MongoDB URI is invalid: ${getSanitizedURI(mongoUri)}`);
        }
      } else {
        logger.warn("MongoDB URI is not set");
      }
    } catch (error) {
      logger.error("Error checking MongoDB URI:", error);
    }

    // Check authentication configuration
    const authSecret = getEnv("NEXTAUTH_SECRET");
    if (authSecret) {
      logger.info("NEXTAUTH_SECRET is set");
    } else {
      logger.warn("NEXTAUTH_SECRET is not set");
    }

    const authUrl = getEnv("NEXTAUTH_URL");
    if (authUrl) {
      logger.info(`NEXTAUTH_URL is set to: ${authUrl}`);
    } else if (nodeEnv === "production") {
      logger.error("NEXTAUTH_URL is required in production but not set");
    } else {
      logger.warn("NEXTAUTH_URL is not set");
    }

    // Summary
    logger.info("\nEnvironment check completed.");
  } catch (error) {
    logger.error("Environment check failed:", error);
    process.exit(1);
  }
}

// Run the check
checkEnvironment().catch((error) => {
  logger.error("Unhandled error during environment check:", error);
  process.exit(1);
});
