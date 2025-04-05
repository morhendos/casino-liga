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
  }
}
