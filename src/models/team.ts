import mongoose from 'mongoose';
import { type ObjectId } from 'mongoose';

export interface TeamDocument extends mongoose.Document {
  name: string;
  players: ObjectId[];  // References to PlayerDocuments
  logo?: string;
  description?: string;
  isActive: boolean;
  createdBy: ObjectId;  // Reference to the User who created this team
  league: ObjectId;     // Reference to the league this team belongs to
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters long'],
    maxlength: [30, 'Team name cannot be longer than 30 characters'],
    index: true
  },
  players: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player'
    }],
    validate: {
      validator: function(players: ObjectId[]) {
        // A valid padel team must have at least 1 player and at most 2 players
        return players.length >= 1 && players.length <= 2;
      },
      message: 'A team must have at least 1 player and at most 2 players'
    },
    required: [true, 'Players are required']
  },
  logo: {
    type: String
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be longer than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true, // Teams must belong to a league
    index: true
  }
}, {
  timestamps: true
});

// Add indexes for performance
teamSchema.index({ name: 'text' });
teamSchema.index({ players: 1 });
teamSchema.index({ league: 1 }); // Index for league lookups

// Method to check if a player is part of this team
teamSchema.methods.hasPlayer = function(playerId: string | ObjectId): boolean {
  return this.players.some((player: ObjectId) => 
    player.toString() === playerId.toString()
  );
};

// Method to check if this team is complete (has 2 players)
teamSchema.methods.isComplete = function(): boolean {
  return this.players.length === 2;
};

export const TeamModel = mongoose.models.Team || mongoose.model<TeamDocument>('Team', teamSchema);
