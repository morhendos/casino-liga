import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { PlayerModel } from '@/models';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/players/[id] - Get a specific player by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`GET request for player ID: ${id}`);
    
    const player = await withConnection(async () => {
      return PlayerModel.findById(id);
    });
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

// PATCH /api/players/[id] - Update a player
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    console.log(`PATCH request for player ID: ${id}`);
    const data = await request.json();
    console.log('Update data received:', data);
    
    const player = await withConnection(async () => {
      const player = await PlayerModel.findById(id);
      
      if (!player) {
        console.log(`Player with ID ${id} not found`);
        throw new Error('Player not found');
      }
      
      // Convert session.user.id and player.userId to strings for comparison
      const sessionUserId = session.user.id;
      const playerUserId = player.userId.toString();
      
      console.log('Session user ID:', sessionUserId);
      console.log('Player user ID:', playerUserId);
      
      // Ensure user can only update their own player profile
      // Flexible comparison to handle potential string/ObjectId type differences
      let isAuthorized = playerUserId === sessionUserId;
      
      // If direct comparison fails, try converting both to same format
      if (!isAuthorized) {
        try {
          // Try comparing normalized ObjectId strings
          const sessionUserObjectId = new mongoose.Types.ObjectId(sessionUserId).toString();
          const playerUserObjectId = new mongoose.Types.ObjectId(playerUserId).toString();
          isAuthorized = sessionUserObjectId === playerUserObjectId;
        } catch (error) {
          console.error('Error comparing user IDs:', error);
          // If conversion fails, authorization remains false
        }
      }
      
      if (!isAuthorized) {
        console.log('Authorization failed - user does not own this profile');
        throw new Error('Unauthorized');
      }
      
      // Update only allowed fields
      if (data.nickname !== undefined) player.nickname = data.nickname;
      if (data.skillLevel !== undefined) player.skillLevel = data.skillLevel;
      if (data.handedness !== undefined) player.handedness = data.handedness;
      if (data.preferredPosition !== undefined) player.preferredPosition = data.preferredPosition;
      if (data.contactPhone !== undefined) player.contactPhone = data.contactPhone;
      if (data.bio !== undefined) player.bio = data.bio;
      if (data.profileImage !== undefined) player.profileImage = data.profileImage;
      if (data.isActive !== undefined) player.isActive = data.isActive;
      
      console.log('Saving updated player:', player);
      return await player.save();
    });
    
    return NextResponse.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Player not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id] - Delete a player (soft delete by setting isActive to false)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    await withConnection(async () => {
      const player = await PlayerModel.findById(id);
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      // Similar flexible authorization check as in PATCH
      const sessionUserId = session.user.id;
      const playerUserId = player.userId.toString();
      
      let isAuthorized = playerUserId === sessionUserId;
      
      if (!isAuthorized) {
        try {
          const sessionUserObjectId = new mongoose.Types.ObjectId(sessionUserId).toString();
          const playerUserObjectId = new mongoose.Types.ObjectId(playerUserId).toString();
          isAuthorized = sessionUserObjectId === playerUserObjectId;
        } catch (error) {
          console.error('Error comparing user IDs:', error);
        }
      }
      
      if (!isAuthorized) {
        throw new Error('Unauthorized');
      }
      
      // Soft delete by setting isActive to false
      player.isActive = false;
      await player.save();
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting player:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Player not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    );
  }
}
