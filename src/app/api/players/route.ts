import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { PlayerModel } from '@/models';
import { CreatePlayerRequest } from '@/types';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

// GET /api/players - Get all players with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nickname = searchParams.get('nickname');
    const skillLevel = searchParams.get('skillLevel');
    const isActive = searchParams.get('isActive');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (nickname) {
      query.nickname = { $regex: nickname, $options: 'i' };
    }
    
    if (skillLevel) {
      query.skillLevel = parseInt(skillLevel);
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    if (userId) {
      // Handle both string IDs and ObjectIds
      try {
        query.userId = new mongoose.Types.ObjectId(userId);
      } catch (err) {
        // If conversion fails, use the original string 
        query.userId = userId;
      }
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

// POST /api/players - Create a new player
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data: CreatePlayerRequest = await request.json();
    
    if (!data.league) {
      return NextResponse.json(
        { error: 'League is required' },
        { status: 400 }
      );
    }
    
    const newPlayer = await withConnection(async () => {
      // Check if user already has a player profile
      // Convert session.user.id to ObjectId when querying
      let userIdObj;
      try {
        userIdObj = new mongoose.Types.ObjectId(session.user.id);
      } catch (err) {
        console.error('Error converting userId to ObjectId:', err);
        // Fall back to using the string ID if conversion fails
        userIdObj = session.user.id;
      }
      
      const existingPlayer = await PlayerModel.findOne({ userId: userIdObj });
      
      if (existingPlayer) {
        throw new Error('User already has a player profile');
      }
      
      // Convert league to ObjectId
      let leagueIdObj;
      try {
        leagueIdObj = new mongoose.Types.ObjectId(data.league);
      } catch (err) {
        console.error('Error converting league to ObjectId:', err);
        throw new Error('Invalid league ID format');
      }
      
      const player = new PlayerModel({
        userId: userIdObj, // Use the converted ObjectId
        nickname: data.nickname,
        skillLevel: data.skillLevel,
        handedness: data.handedness,
        preferredPosition: data.preferredPosition,
        contactPhone: data.contactPhone,
        bio: data.bio,
        profileImage: data.profileImage,
        league: leagueIdObj, // Add the league field
        isActive: true
      });
      
      return await player.save();
    });
    
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    
    if (error instanceof Error) {
      if (error.message === 'User already has a player profile') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      if (error.message === 'Invalid league ID format') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
