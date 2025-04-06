import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';
import invitationService from '@/lib/services/invitation-service';
import logger from '@/lib/logger';

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
    
    // Invite player using the invitation service
    const result = await withConnection(async () => {
      const player = await invitationService.invitePlayer(id);
      
      if (!player) {
        throw new Error('Failed to invite player');
      }
      
      // For testing, return the invitation URL that would be sent
      const invitationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/invite?token=${player.invitationToken}`;
      
      return {
        success: true,
        player: {
          id: player._id,
          email: player.email,
          nickname: player.nickname,
          status: player.status
        },
        // Only include invitation URL in non-production environments
        ...(process.env.NODE_ENV !== 'production' && { invitationUrl })
      };
    });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error sending invitation:', error);
    
    if (error instanceof Error) {
      const errorMessages = [
        'Player not found',
        'Player does not have an email address',
        'Player already has a user account',
        'Invitation already sent to this player',
        'Failed to invite player'
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
