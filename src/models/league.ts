import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

// Type definitions
type LeagueStatus = 'draft' | 'registration' | 'active' | 'completed' | 'canceled';
type MatchFormat = 'bestOf3' | 'bestOf5' | 'singleSet';

// Define the League Document interface
export interface LeagueDocument extends mongoose.Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
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

// Create the schema without type checking during definition
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
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  maxTeams: {
    type: Number,
    required: [true, 'Maximum number of teams is required'],
    min: [2, 'There must be at least 2 teams'],
    default: 16
  },
  minTeams: {
    type: Number,
    required: [true, 'Minimum number of teams is required'],
    min: [2, 'There must be at least 2 teams'],
    default: 4
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }
  ],
  matchFormat: {
    type: String,
    enum: ['bestOf3', 'bestOf5', 'singleSet'],
    default: 'bestOf3'
  },
  venue: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'registration', 'active', 'completed', 'canceled'],
    default: 'draft'
  },
  banner: {
    type: String
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
    required: true
  }
}, {
  timestamps: true
});

// Add custom validation after schema creation
leagueSchema.path('startDate').validate(function(this: LeagueDocument, startDate: Date) {
  return startDate >= new Date();
}, 'Start date must be in the future');

leagueSchema.path('endDate').validate(function(this: LeagueDocument, endDate: Date) {
  return this.startDate && endDate > this.startDate;
}, 'End date must be after the start date');

leagueSchema.path('registrationDeadline').validate(function(this: LeagueDocument, deadline: Date) {
  return this.startDate && deadline <= this.startDate;
}, 'Registration deadline must be before or on the start date');

leagueSchema.path('minTeams').validate(function(this: LeagueDocument, minTeams: number) {
  return this.maxTeams && minTeams <= this.maxTeams;
}, 'Minimum teams must be less than or equal to maximum teams');

// Add indexes
leagueSchema.index({ name: 'text' });
leagueSchema.index({ status: 1 });
leagueSchema.index({ startDate: 1 });
leagueSchema.index({ organizer: 1 });

// Instance methods
leagueSchema.methods.isRegistrationOpen = function(): boolean {
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
export const LeagueModel = mongoose.models.League ? 
  mongoose.model<LeagueDocument>('League') : 
  mongoose.model<LeagueDocument>('League', leagueSchema);
