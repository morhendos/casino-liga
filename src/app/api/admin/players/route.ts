import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { PlayerModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';
import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * Check if the user has admin permissions based on their session roles
 */
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// GET /api/admin/players - Get all players with optional filtering
export async function GET(request: Request) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname');
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (nickname) {
      query.nickname = { $regex: nickname, $options: 'i' };
    }
    
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const players = await withConnection(async () => {
      const total = await PlayerModel.countDocuments(query);
      const players = await PlayerModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return {
        players,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    });
    
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

// POST /api/admin/players - Create a new player (admin only)
export async function POST(request: Request) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    console.log('Received player data:', data);
    
    // Validate nickname
    if (!data.nickname) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }
    
    // If email is provided, validate it
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Create player
    const newPlayer = await withConnection(async () => {
      // Check if player with same nickname or email already exists
      if (data.email) {
        const existingPlayerByEmail = await PlayerModel.findOne({ email: data.email });
        if (existingPlayerByEmail) {
          throw new Error('A player with this email already exists');
        }
      }
      
      const existingPlayerByNickname = await PlayerModel.findOne({ nickname: data.nickname });
      if (existingPlayerByNickname) {
        throw new Error('A player with this nickname already exists');
      }
      
      // Create player data object
      let playerData: any = {
        nickname: data.nickname,
        skillLevel: data.skillLevel || 5,
        handedness: data.handedness || 'right',
        preferredPosition: data.preferredPosition || 'both',
        contactPhone: data.contactPhone,
        bio: data.bio,
        isActive: true,
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(session.user.id)
      };
      
      // Add email if provided
      if (data.email) {
        playerData.email = data.email;
        
        // Set up invitation fields for players with email
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days expiration
        
        playerData = {
          ...playerData,
          status: 'invited',
          invitationSent: false,
          invitationToken: token,
          invitationExpires: expires
        };
      }
      
      console.log('Creating player with data:', playerData);
      
      try {
        const player = new PlayerModel(playerData);
        return await player.save();
      } catch (saveError) {
        console.error('Error saving player:', saveError);
        throw saveError;
      }
    });
    
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    
    if (error instanceof Error) {
      if (error.message === 'A player with this email already exists' ||
          error.message === 'A player with this nickname already exists') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      // Include the actual error message in the response for debugging
      return NextResponse.json(
        { error: `Failed to create player: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
