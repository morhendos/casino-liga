import { PlayerDocument, PlayerModel } from '@/models/player';
import emailService from './email-service';
import crypto from 'crypto';
import logger from '../logger';

/**
 * Service for handling player invitations
 */
export class InvitationService {
  /**
   * Generate a secure random token for player invitations
   * 
   * @returns A randomly generated token
   */
  generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Calculate the expiration date for an invitation
   * 
   * @param daysValid Number of days the invitation should be valid
   * @returns Date when the invitation will expire
   */
  calculateExpirationDate(daysValid: number = 7): Date {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysValid);
    return expirationDate;
  }
  
  /**
   * Invite a player to join the platform
   * 
   * @param playerId ID of the player to invite
   * @returns The updated player document or null if the player was not found
   */
  async invitePlayer(playerId: string): Promise<PlayerDocument | null> {
    try {
      // Find the player
      const player = await PlayerModel.findById(playerId);
      if (!player) {
        logger.error(`Player not found with ID: ${playerId}`);
        return null;
      }
      
      // Check if the player has an email
      if (!player.email) {
        logger.error(`Cannot invite player with ID ${playerId} - no email address`);
        return null;
      }
      
      // Generate invitation token and set expiration
      const invitationToken = this.generateInvitationToken();
      const invitationExpires = this.calculateExpirationDate();
      
      // Update player with invitation info
      player.invitationToken = invitationToken;
      player.invitationExpires = invitationExpires;
      player.status = 'invited';
      
      // Save player before sending email to ensure the token is stored
      await player.save();
      
      // Send invitation email
      const emailSent = await emailService.sendInvitationEmail(player, invitationToken);
      
      // Update player status based on email result
      return await emailService.updatePlayerAfterInvite(player, emailSent);
    } catch (error) {
      logger.error('Error inviting player:', error);
      return null;
    }
  }
  
  /**
   * Validate an invitation token
   * 
   * @param token The invitation token to validate
   * @returns The player document if the token is valid, null otherwise
   */
  async validateInvitationToken(token: string): Promise<PlayerDocument | null> {
    try {
      const player = await PlayerModel.findOne({
        invitationToken: token,
        invitationExpires: { $gt: new Date() } // Token hasn't expired
      });
      
      if (!player) {
        logger.warn(`Invalid or expired invitation token: ${token}`);
        return null;
      }
      
      return player;
    } catch (error) {
      logger.error('Error validating invitation token:', error);
      return null;
    }
  }
  
  /**
   * Clear the invitation data from a player after successful registration
   * 
   * @param player The player to update
   * @returns The updated player document
   */
  async clearInvitationAfterRegistration(player: PlayerDocument): Promise<PlayerDocument> {
    player.invitationToken = undefined;
    player.invitationExpires = undefined;
    player.status = 'active';
    
    await player.save();
    return player;
  }
}

// Create a singleton instance
const invitationService = new InvitationService();
export default invitationService;