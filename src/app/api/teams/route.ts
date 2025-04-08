import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withConnection } from '@/lib/db';
import { TeamModel, PlayerModel } from '@/models';
import { CreateTeamRequest } from '@/types';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';

// GET /api/teams - Get all teams with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const playerId = searchParams.get('playerId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    if (playerId && playerId !== 'undefined') {
      console.log(`Querying teams for player ID: ${playerId}`);
      try {
        // Try to convert to ObjectId if it's a valid MongoDB ID
        const playerObjectId = new mongoose.Types.ObjectId(playerId);
        query.players = playerObjectId;
      } catch (err) {
        // If conversion fails, use the original ID
        console.log(`Could not convert player ID to ObjectId: ${playerId}`);
        query.players = playerId;
      }
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    console.log('Teams query:', JSON.stringify(query));
    
    const teams = await withConnection(async () => {
      const total = await TeamModel.countDocuments(query);
      const teams = await TeamModel.find(query)
        .populate('players')  // Populate player details
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      console.log(`Found ${teams.length} teams`);
      
      return {
        teams,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    });
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Creating team for user:', session.user.id);
    
    // Get the request data
    const requestBody = await request.text();
    console.log('Request body:', requestBody);
    
    let data: CreateTeamRequest;
    try {
      data = JSON.parse(requestBody);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }
    
    console.log('Parsed team data:', data);
    
    // Validate that at least one player is provided
    if (!data.players || data.players.length === 0) {
      return NextResponse.json(
        { error: 'A team must have at least one player' },
        { status: 400 }
      );
    }
    
    // Validate that not more than 2 players are provided
    if (data.players.length > 2) {
      return NextResponse.json(
        { error: 'A team cannot have more than 2 players' },
        { status: 400 }
      );
    }
    
    // Create the team using withConnection to handle database operations
    const newTeam = await withConnection(async () => {
      // Convert player IDs to ObjectIds if needed
      const playerIds = data.players.map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (err) {
          console.error(`Error converting player ID to ObjectId: ${id}`, err);
          return id; // Use the original ID if conversion fails
        }
      });
      
      console.log('Converted player IDs:', playerIds);
      
      // Check if players exist
      for (const playerId of playerIds) {
        const player = await PlayerModel.findById(playerId);
        if (!player) {
          console.error(`Player with ID ${playerId} not found`);
          throw new Error(`Player with ID ${playerId} not found`);
        }
        if (!player.isActive) {
          console.error(`Player with ID ${playerId} is not active`);
          throw new Error(`Player with ID ${playerId} is not active`);
        }
        console.log(`Verified player ${playerId} exists and is active`);
      }
      
      // Check if team with the same name already exists
      const existingTeam = await TeamModel.findOne({ name: data.name });
      if (existingTeam) {
        console.error(`Team with name "${data.name}" already exists`);
        throw new Error('Team with this name already exists');
      }
      
      // Convert user ID to ObjectId for createdBy field
      let createdById;
      try {
        createdById = new mongoose.Types.ObjectId(session.user.id);
      } catch (err) {
        console.error(`Error converting user ID to ObjectId: ${session.user.id}`, err);
        createdById = session.user.id; // Use the original ID if conversion fails
      }
      
      console.log('Creating team with createdBy:', createdById);
      
      // Create the team
      const team = new TeamModel({
        name: data.name,
        players: playerIds,
        logo: data.logo,
        description: data.description,
        isActive: true,
        createdBy: createdById
      });
      
      console.log('Team object before save:', team);
      
      // Use try/catch to log validation errors
      try {
        return await team.save();
      } catch (err) {
        console.error('Error saving team:', err);
        if (err instanceof Error) {
          if (err.name === 'ValidationError') {
            // Extract validation error messages
            const validationErrors = Object.values((err as any).errors);
            const messages = validationErrors.map((error: any) => error.message).join(', ');
            throw new Error(`Validation error: ${messages}`);
          }
        }
        throw err; // Re-throw for other errors
      }
    });
    
    console.log('Team created successfully:', newTeam);
    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Player with ID')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message === 'Team with this name already exists') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Validation error:')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Return the actual error message
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
