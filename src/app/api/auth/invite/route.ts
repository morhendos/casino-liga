import { NextRequest, NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { UserModel } from '@/models';
import invitationService from '@/lib/services/invitation-service';
import logger from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for invitation registration
const inviteRegisterSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// GET /api/auth/invite?token=xyz - Validate invitation token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    const result = await withConnection(async () => {
      const player = await invitationService.validateInvitationToken(token);
      
      if (!player) {
        return { valid: false, message: 'Invitation token is invalid or expired' };
      }
      
      return { 
        valid: true, 
        playerInfo: {
          id: player._id,
          email: player.email,
          nickname: player.nickname
        }
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error validating invitation token:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation token' },
      { status: 500 }
    );
  }
}

// POST /api/auth/invite - Register a new user from an invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = inviteRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { token, name, password } = validationResult.data;
    
    const result = await withConnection(async () => {
      // Validate the invitation token
      const player = await invitationService.validateInvitationToken(token);
      
      if (!player) {
        throw new Error('Invalid or expired invitation token');
      }
      
      // Check if a user already exists with this email
      const existingUser = await UserModel.findOne({ email: player.email });
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the new user
      const newUser = new UserModel({
        name,
        email: player.email,
        hashedPassword,
        emailVerified: true, // Auto-verify since we're using an invitation
        invitedPlayerId: player._id
      });
      
      await newUser.save();
      
      // Update the player with the new user ID
      player.userId = newUser._id;
      player.status = 'active';
      
      // Clear invitation data
      await invitationService.clearInvitationAfterRegistration(player);
      
      return { 
        success: true,
        message: 'User registration successful',
        email: player.email
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error registering user from invitation:', error);
    
    if (error instanceof Error) {
      const knownErrors = [
        'Invalid or expired invitation token',
        'A user with this email already exists'
      ];
      
      if (knownErrors.includes(error.message)) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
