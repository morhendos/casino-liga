import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

// Type definitions
export type LeagueStatus = 'draft' | 'registration' | 'active' | 'completed' | 'canceled';
export type MatchFormat = 'bestOf3' | 'bestOf5' | 'singleSet';

// Define the League Document interface
export interface LeagueDocument extends mongoose.Document {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  registrationDeadline?: Date;
  maxTeams: number;
  minTeams: number;
  teams: ObjectId[];
  matchFormat: MatchFormat;
  venue?: string;
  status: LeagueStatus;
  banner?: string;
  scheduleGenerated: boolean;
  pointsPerWin: number;
  pointsPerLoss: number;
  organizer: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  isRegistrationOpen(): boolean;
  isFull(): boolean;
  hasTeam(teamId: string | ObjectId): boolean;
}

// Create the schema - use type assertion to avoid TypeScript errors
const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true,
    minlength: [3, 'League name must be at least 3 characters long'],
    maxlength: [50, 'League name cannot be longer than 50 characters'],
    index: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be longer than 1000 characters'],
    default: ""
  },
  startDate: {
    type: Date,
    required: false,
    validate: {
      validator: function(startDate: Date): boolean {
        if (!startDate) return true; // Skip validation if not provided
        const now = new Date();
        // Allow dates from yesterday to allow for timezone differences
        now.setDate(now.getDate() - 1);
        return startDate >= now;
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: false,
    validate: {
      validator: function(endDate: Date): boolean {
        if (!endDate) return true; // Skip validation if not provided
        // Only validate against startDate if both are provided
        // @ts-ignore - TypeScript doesn't understand 'this' in Mongoose validators
        if (this.startDate && endDate) {
          // @ts-ignore
          return endDate > this.startDate;
        }
        return true;
      },
      message: 'End date must be after the start date'
    }
  },
  registrationDeadline: {
    type: Date,
    required: false,
    validate: {
      validator: function(deadline: Date): boolean {
        if (!deadline) return true; // Skip validation if not provided
        // Only validate against startDate if both are provided
        // @ts-ignore - TypeScript doesn't understand 'this' in Mongoose validators
        if (this.startDate && deadline) {
          // @ts-ignore
          return deadline <= this.startDate;
        }
        return true;
      },
      message: 'Registration deadline must be before or on the start date'
    }
  },
  maxTeams: {
    type: Number,
    min: [2, 'There must be at least 2 teams'],
    default: 16
  },
  minTeams: {
    type: Number,
    min: [2, 'There must be at least 2 teams'],
    default: 4,
    validate: {
      validator: function(minTeams: number): boolean {
        // @ts-ignore - TypeScript doesn't understand 'this' in Mongoose validators
        return this.maxTeams && minTeams <= this.maxTeams;
      },
      message: 'Minimum teams must be less than or equal to maximum teams'
    }
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: []
  }],
  matchFormat: {
    type: String,
    enum: {
      values: ['bestOf3', 'bestOf5', 'singleSet'],
      message: '{VALUE} is not a valid match format'
    },
    default: 'bestOf3'
  },
  venue: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'registration', 'active', 'completed', 'canceled'],
      message: '{VALUE} is not a valid league status'
    },
    default: 'draft'
  },
  banner: {
    type: String,
    default: ""
  },
  scheduleGenerated: {
    type: Boolean,
    default: false
  },
  pointsPerWin: {
    type: Number,
    default: 3,
    min: [1, 'Points per win must be at least 1']
  },
  pointsPerLoss: {
    type: Number,
    default: 0,
    min: [0, 'Points per loss must be at least 0']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'League organizer is required']
  }
}, {
  timestamps: true
});

// Add indexes
leagueSchema.index({ name: 'text' });
leagueSchema.index({ status: 1 });
leagueSchema.index({ startDate: 1 });
leagueSchema.index({ organizer: 1 });

// Instance methods
leagueSchema.methods.isRegistrationOpen = function(): boolean {
  // If no registration deadline, consider registration closed
  if (!this.registrationDeadline) return false;
  
  const now = new Date();
  return this.status === 'registration' && now <= this.registrationDeadline;
};

leagueSchema.methods.isFull = function(): boolean {
  return this.teams.length >= this.maxTeams;
};

leagueSchema.methods.hasTeam = function(teamId: string | ObjectId): boolean {
  return this.teams.some((team: ObjectId) => 
    team.toString() === teamId.toString()
  );
};

// Create and export the model
// Use module augmentation to avoid TypeScript errors with model creation
// @ts-ignore - Ignore TypeScript errors for mongoose model creation
export const LeagueModel = mongoose.models.League || 
  mongoose.model<LeagueDocument>('League', leagueSchema);
