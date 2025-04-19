import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

export interface RankingDocument extends mongoose.Document {
  league: ObjectId;
  team: ObjectId;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  pointsScored: number;
  pointsConceded: number;
  createdAt: Date;
  updatedAt: Date;
}

const rankingSchema = new mongoose.Schema({
  league: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: [true, 'League is required']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team is required']
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  matchesPlayed: {
    type: Number,
    default: 0,
    min: [0, 'Matches played cannot be negative']
  },
  wins: {
    type: Number,
    default: 0,
    min: [0, 'Wins cannot be negative']
  },
  losses: {
    type: Number,
    default: 0,
    min: [0, 'Losses cannot be negative']
  },
  setsWon: {
    type: Number,
    default: 0,
    min: [0, 'Sets won cannot be negative']
  },
  setsLost: {
    type: Number,
    default: 0,
    min: [0, 'Sets lost cannot be negative']
  },
  pointsScored: {
    type: Number,
    default: 0,
    min: [0, 'Points scored cannot be negative']
  },
  pointsConceded: {
    type: Number,
    default: 0,
    min: [0, 'Points conceded cannot be negative']
  }
}, {
  timestamps: true
});

// Create a compound index for league and team
rankingSchema.index({ league: 1, team: 1 }, { unique: true });

// Method to calculate the set ratio (sets won / sets played)
rankingSchema.methods.getSetRatio = function(): number {
  const totalSets = this.setsWon + this.setsLost;
  return totalSets > 0 ? this.setsWon / totalSets : 0;
};

// Method to calculate the point ratio (points scored / points conceded)
rankingSchema.methods.getPointRatio = function(): number {
  return this.pointsConceded > 0 ? this.pointsScored / this.pointsConceded : this.pointsScored;
};

// Create and export the model
export const RankingModel = mongoose.models.Ranking || 
  mongoose.model<RankingDocument>('Ranking', rankingSchema);
