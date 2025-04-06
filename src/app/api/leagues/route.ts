import { NextResponse } from 'next/server';
import { withConnection } from '@/lib/db';
import { LeagueModel } from '@/models';
import { CreateLeagueRequest } from '@/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasRole, ROLES } from '@/lib/auth/role-utils';

/**
 * Check if the user has admin permissions based on their session roles
 */
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return hasRole(session, ROLES.ADMIN);
}

// GET /api/leagues - Get all leagues with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const status = searchParams.get('status');
    const organizer = searchParams.get('organizer');
    const active = searchParams.get('active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (organizer) {
      query.organizer = organizer;
    }
    
    if (active === 'true') {
      // Active leagues are those in 'registration' or 'active' status
      query.status = { $in: ['registration', 'active'] };
    }
    
    const leagues = await withConnection(async () => {
      const total = await LeagueModel.countDocuments(query);
      const leagues = await LeagueModel.find(query)
        .populate('organizer', 'name email')
        .populate({
          path: 'teams',
          populate: {
            path: 'players',
            select: 'nickname skillLevel'
          }
        })
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit);
      
      return {
        leagues,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    });
    
    return NextResponse.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

// POST /api/leagues - Create a new league (admin only)
export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin role
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Forbidden: Admin privileges required' },
        { status: 403 }
      );
    }
    
    const data: CreateLeagueRequest = await request.json();
    const organizerId = session.user.id;
    
    const newLeague = await withConnection(async () => {
      // Check if league with the same name already exists
      const existingLeague = await LeagueModel.findOne({ name: data.name });
      
      if (existingLeague) {
        throw new Error('League with this name already exists');
      }
      
      // Create a base league object without date fields
      const leagueData: any = {
        name: data.name,
        description: data.description || "",
        maxTeams: data.maxTeams || 16,
        minTeams: data.minTeams || 4,
        matchFormat: data.matchFormat || "bestOf3",
        venue: data.venue || "",
        status: 'draft', // New leagues start in draft mode
        banner: data.banner || "",
        scheduleGenerated: false,
        pointsPerWin: data.pointsPerWin || 3,
        pointsPerLoss: data.pointsPerLoss || 0,
        organizer: organizerId,
        teams: []
      };
      
      // Only add date fields if they exist and are valid
      if (data.startDate) {
        const startDate = new Date(data.startDate);
        if (!isNaN(startDate.getTime())) {
          leagueData.startDate = startDate;
        }
      }
      
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (!isNaN(endDate.getTime())) {
          leagueData.endDate = endDate;
        }
      }
      
      if (data.registrationDeadline) {
        const registrationDeadline = new Date(data.registrationDeadline);
        if (!isNaN(registrationDeadline.getTime())) {
          leagueData.registrationDeadline = registrationDeadline;
        }
      }
      
      // Create the league
      const league = new LeagueModel(leagueData);
      
      const savedLeague = await league.save();
      
      // Return a plain object with an id property that can be directly accessed in the frontend
      return {
        id: savedLeague._id.toString(),
        name: savedLeague.name,
        description: savedLeague.description,
        startDate: savedLeague.startDate,
        endDate: savedLeague.endDate,
        registrationDeadline: savedLeague.registrationDeadline,
        maxTeams: savedLeague.maxTeams,
        minTeams: savedLeague.minTeams,
        matchFormat: savedLeague.matchFormat,
        venue: savedLeague.venue,
        status: savedLeague.status,
        banner: savedLeague.banner,
        scheduleGenerated: savedLeague.scheduleGenerated,
        pointsPerWin: savedLeague.pointsPerWin,
        pointsPerLoss: savedLeague.pointsPerLoss,
        organizer: savedLeague.organizer.toString(),
        teams: []
      };
    });
    
    return NextResponse.json(newLeague, { status: 201 });
  } catch (error) {
    console.error('Error creating league:', error);
    
    if (error instanceof Error) {
      if (error.message === 'League with this name already exists') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    );
  }
}
