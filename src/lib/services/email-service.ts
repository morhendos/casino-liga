import { PlayerDocument } from '@/models/player';
import logger from '../logger';

/**
 * Service for sending email notifications
 */
export class EmailService {
  /**
   * Send an invitation email to a player
   * 
   * @param player The player to invite
   * @param invitationToken The token for the invitation link
   * @returns Promise that resolves when the email is sent
   */
  async sendInvitationEmail(player: PlayerDocument, invitationToken: string): Promise<boolean> {
    try {
      if (!player.email) {
        logger.error('Cannot send invitation email - player has no email address');
        return false;
      }
      
      const invitationLink = `${process.env.NEXTAUTH_URL}/auth/invite?token=${invitationToken}`;
      
      // In a real implementation, this would use an email service like SendGrid, AWS SES, etc.
      // For now, we'll just log the email that would be sent
      logger.info(`SENDING INVITATION EMAIL to ${player.email}:
        Subject: You've been invited to join Padeliga
        Body: 
        Hello ${player.nickname},
        
        You've been invited to join Padeliga! Click the link below to create your account:
        ${invitationLink}
        
        This invitation will expire in 7 days.
      `);
      
      // For testing purposes, we'll return true to simulate success
      // In production, you'd return the result from the actual email provider
      return true;
    } catch (error) {
      logger.error('Error sending invitation email:', error);
      return false;
    }
  }
  
  /**
   * Update a player's status after sending an invitation
   * 
   * @param player The player to update
   * @param emailSent Whether the email was sent successfully
   * @returns The updated player document
   */
  async updatePlayerAfterInvite(player: PlayerDocument, emailSent: boolean): Promise<PlayerDocument> {
    if (emailSent) {
      player.invitationSent = true;
      player.status = 'invited';
    }
    
    await player.save();
    return player;
  }
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService;