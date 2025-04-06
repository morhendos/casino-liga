import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { PlayerModel } from '@/models';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

/**
 * Check if the user has admin permissions based on their session roles
 */
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// POST /api/admin/players/[id]/invite - Send invitation to a player
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const id = params.id;
    
    // Update player and send invitation email
    const result = await withConnection(async () => {
      const player = await PlayerModel.findById(id);
      
      if (!player) {
        throw new Error('Player not found');
      }
      
      // Check if player has an email
      if (!player.email) {
        throw new Error('Player does not have an email address');
      }
      
      // Check if player already has a user account
      if (player.userId) {
        throw new Error('Player already has a user account');
      }
      
      // Check if invitation already sent
      if (player.invitationSent) {
        throw new Error('Invitation already sent to this player');
      }
      
      // Mark invitation as sent
      player.invitationSent = true;
      
      // Refresh invitation token and expiration if needed
      if (!player.invitationToken || !player.invitationExpires || player.invitationExpires < new Date()) {
        const crypto = require('crypto');
        player.invitationToken = crypto.randomBytes(32).toString('hex');
        
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days expiration
        player.invitationExpires = expires;
      }
      
      await player.save();
      
      // Here you would typically send an email with the invitation link
      // This is just a placeholder for the actual email sending
      console.log(`Sending invitation to ${player.email} with token ${player.invitationToken}`);
      
      // For testing, return the invitation URL that would be sent
      const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/join?token=${player.invitationToken}`;
      
      return {
        success: true,
        playerEmail: player.email,
        // Only include invitation URL in non-production environments
        ...(process.env.NODE_ENV !== 'production' && { invitationUrl })
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending invitation:', error);
    
    if (error instanceof Error) {
      const errorMessages = [
        'Player not found',
        'Player does not have an email address',
        'Player already has a user account',
        'Invitation already sent to this player'
      ];
      
      if (errorMessages.includes(error.message)) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
