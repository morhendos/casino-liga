import { Role } from '@/types/auth';
import 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      roles: Role[];
      image?: string | null; // Add image property to match usage in dashboard
    }
  }
}

// Extend the JWT type with our custom fields
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    roles: Role[];
    picture?: string; // JWT uses 'picture' for the image
  }
}
