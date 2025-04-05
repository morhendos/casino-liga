import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { UserModel } from '@/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

// Helper function to check if the user has admin permissions
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

/**
 * GET /api/admin/users
 * 
 * Retrieve a list of all users (admin only)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const roleId = searchParams.get('roleId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const skip = (page - 1) * limit;
    
    // Build the query
    const query: any = {};
    
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (roleId) {
      query['roles.id'] = roleId;
    }
    
    const users = await withConnection(async () => {
      const total = await UserModel.countDocuments(query);
      const users = await UserModel.find(query)
        .select('-hashedPassword -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * 
 * Update user roles (admin only)
 */
export async function PATCH(request: Request) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    const { userId, roles } = data;
    
    if (!userId || !roles || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: 'Invalid request: userId and roles array are required' },
        { status: 400 }
      );
    }
    
    // Ensure each role has id and name
    const validRoles = roles.every(role => role.id && role.name);
    if (!validRoles) {
      return NextResponse.json(
        { error: 'Invalid role format: each role must have id and name properties' },
        { status: 400 }
      );
    }
    
    const updatedUser = await withConnection(async () => {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update roles
      user.roles = roles;
      
      await user.save();
      
      // Return user without sensitive fields
      const userObject = user.toJSON();
      return userObject;
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user roles:', error);
    
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user roles' },
      { status: 500 }
    );
  }
}
