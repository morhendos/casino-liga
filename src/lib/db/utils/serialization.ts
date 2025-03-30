/**
 * Database Serialization Utilities
 * 
 * Utilities for safely serializing MongoDB/Mongoose objects
 * to prevent circular references and handle special MongoDB types.
 */

import mongoose from 'mongoose';

/**
 * Safe serialize function to prevent circular references in Mongoose documents
 * 
 * @param obj Object to serialize
 * @returns Safely serialized object
 */
export function safeSerialize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle Mongoose document - convert to POJO
  if (obj.toObject && typeof obj.toObject === 'function') {
    return safeSerialize(obj.toObject());
  }
  
  // Handle MongoDB ObjectId
  if (obj instanceof mongoose.Types.ObjectId) {
    return obj.toString();
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => safeSerialize(item));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      // Skip Mongoose document methods and private fields
      if (key.startsWith('$') || (key.startsWith('_') && key !== '_id')) {
        continue;
      }
      try {
        result[key] = safeSerialize(obj[key]);
      } catch {
        // If serialization fails, use a placeholder
        result[key] = '[Unserializable]';
      }
    }
    return result;
  }
  
  // Return primitives as is
  return obj;
}

/**
 * Convert a Mongoose document to a plain JavaScript object
 * 
 * @param doc Mongoose document
 * @returns Plain JavaScript object
 */
export function toObject(doc: any): any {
  if (!doc) {
    return doc;
  }
  
  if (doc.toObject && typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  
  if (Array.isArray(doc)) {
    return doc.map(item => toObject(item));
  }
  
  return doc;
}

/**
 * Safely handle JSON serialization for API responses
 * 
 * @param data Data to serialize
 * @returns JSON-safe data
 */
export function toJSON(data: any): any {
  return JSON.parse(JSON.stringify(safeSerialize(data)));
}
