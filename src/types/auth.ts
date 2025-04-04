export interface Role {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simplified user interface for authentication purposes
 * This is used during the login/registration process before
 * the full user profile is loaded
 */
export interface CustomUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
}

export interface Session {
  user: AuthUser;
  expires: Date;
}
