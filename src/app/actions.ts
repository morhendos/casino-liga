'use server'

import { CustomUser } from '@/types/auth';
import bcrypt from 'bcryptjs';
import { UserModel } from '@/models/user';
import { withConnection, handleMongoError, logMongoError } from '@/lib/db';
import { loadEnvVars, ensureEnvVars } from '@/config/environment';

// Load env vars at the module level to ensure they're available
loadEnvVars();
ensureEnvVars();

interface AuthResult {
  success: boolean;
  data?: CustomUser;
  error?: {
    code: string;
    message: string;
  };
}

// Interface for MongoDB validation errors
interface ValidationError {
  name: string;
  errors: {
    [key: string]: {
      message: string;
    }
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

function serializeUser(user: any): CustomUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    roles: user.roles.map((role: any) => ({
      id: role.id,
      name: role.name
    }))
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log(`[Auth] Attempting login for user: ${email}`);
    
    // Use simplified connection (no options parameter)
    const user = await withConnection(async () => {
      // Extended timeout is handled internally by the simplified connection
      return UserModel.findOne({ email: email.toLowerCase() });
    });
    
    if (!user) {
      console.log(`[Auth] No user found with email: ${email}`);
      return {
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'No account found with this email. Please check your email or create a new account.'
        }
      };
    }

    console.log(`[Auth] User found, verifying password`);
    
    // Verify password
    const isValid = await comparePasswords(password, user.hashedPassword);
    if (!isValid) {
      console.log(`[Auth] Invalid password for user: ${email}`);
      return {
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'Incorrect password. Please try again.'
        }
      };
    }

    console.log(`[Auth] Login successful for user: ${email}`);
    
    return {
      success: true,
      data: serializeUser(user)
    };
  } catch (error) {
    console.error(`[Auth] Error during authentication:`, error);
    logMongoError(error, 'User authentication');
    
    // Provide more specific error message for timeouts
    if (error instanceof Error && 
        (error.message.includes('timed out') || 
         error.message.includes('timeout') ||
         error.name === 'MongoServerSelectionError')) {
      console.error(`[Auth] Database connection timeout during authentication`);
      
      return {
        success: false,
        error: {
          code: 'timeout_error',
          message: 'Database connection timed out. Please try again.'
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'server_error',
        message: 'An unexpected error occurred. Please try again.'
      }
    };
  }
}

export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult> {
  try {
    console.log('Starting user registration process for email:', email);
    
    // Check if user exists (simplified connection)
    const existingUser = await withConnection(async () => {
      return UserModel.findOne({ email: email.toLowerCase() });
    });
    
    if (existingUser) {
      console.log('User already exists with this email');
      return {
        success: false,
        error: {
          code: 'email_exists',
          message: 'This email is already registered. Please use a different email or log in.'
        }
      };
    }

    // Hash password
    console.log('Hashing password');
    const hashedPassword = await hashPassword(password);

    // Create user with detailed logging
    console.log('Creating new user');
    try {
      const user = await withConnection(async () => {
        return UserModel.create({
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          hashedPassword,
          roles: [{ id: '1', name: 'user' }]
        });
      });
      
      console.log('User created successfully with ID:', user._id);
      
      return {
        success: true,
        data: serializeUser(user)
      };
    } catch (error) {
      console.error('Error creating user:', error);
      // Check for specific validation errors
      if (error && typeof error === 'object' && 'name' in error) {
        const modelError = error as ValidationError;
        
        if (modelError.name === 'ValidationError' && modelError.errors) {
          const validationErrors = Object.keys(modelError.errors)
            .map(field => modelError.errors[field].message)
            .join('; ');
            
          return {
            success: false,
            error: {
              code: 'validation_error',
              message: `Validation failed: ${validationErrors}`
            }
          };
        }
      }
      
      throw error; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    logMongoError(error, 'User registration');
    
    console.error('Registration error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined
    });
    
    // Provide more specific error message for timeouts
    if (error instanceof Error && 
        (error.message.includes('timed out') || 
         error.message.includes('timeout') ||
         error.name === 'MongoServerSelectionError')) {
      console.error(`[Auth] Database connection timeout during registration`);
      
      return {
        success: false,
        error: {
          code: 'timeout_error',
          message: 'Database connection timed out. Please try again.'
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'server_error',
        message: 'An unexpected error occurred during registration. Please try again.'
      }
    };
  }
}