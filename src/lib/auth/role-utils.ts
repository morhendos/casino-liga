import { Session } from '@/types/auth';

/**
 * Predefined role IDs for the application
 */
export const ROLES = {
  ADMIN: '2',
  PLAYER: '1'
};

/**
 * Check if the user has a specific role
 * @param session The user session
 * @param roleId The role ID to check for
 * @returns boolean indicating if the user has the role
 */
export function hasRole(session: Session | null, roleId: string): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) {
    return false;
  }
  
  return session.user.roles.some(role => role.id === roleId);
}

/**
 * Check if the user has any of the specified roles
 * @param session The user session
 * @param roleIds Array of role IDs to check
 * @returns boolean indicating if the user has any of the roles
 */
export function hasAnyRole(session: Session | null, roleIds: string[]): boolean {
  if (!session?.user?.roles || !Array.isArray(session.user.roles)) {
    return false;
  }
  
  return session.user.roles.some(role => roleIds.includes(role.id));
}

/**
 * Check if the user has admin role
 * @param session The user session
 * @returns boolean indicating if the user is an admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ROLES.ADMIN);
}

/**
 * Check if the user is a player (default role)
 * @param session The user session
 * @returns boolean indicating if the user is a player
 */
export function isPlayer(session: Session | null): boolean {
  return hasRole(session, ROLES.PLAYER);
}
