import mongoose from 'mongoose';
import { type ObjectId } from 'mongoose';

// Define interface for mongoose validator props
interface ValidatorProps {
  value: any;
  path: string;
}

export interface PlayerDocument extends mongoose.Document {
  userId?: ObjectId;         // Optional to allow admin-created players without users
  email?: string;           // Added to support player invitations
  nickname: string;
  skillLevel: number;       // Can be a rating from 1-10
  handedness: 'left' | 'right' | 'ambidextrous';
  preferredPosition: 'forehand' | 'backhand' | 'both';
  contactPhone?: string;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  createdBy?: ObjectId;     // Reference to admin user who created this player
  // Invitation fields
  status: 'invited' | 'active' | 'inactive';
  invitationSent: boolean;
  invitationToken?: string;
  invitationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false to allow admin-created players
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    index: true,
    required: false // Email is optional for admin-created players
  },
  nickname: {
    type: String,
    required: [true, 'Nickname is required'],
    trim: true,
    minlength: [2, 'Nickname must be at least 2 characters long'],
    maxlength: [20, 'Nickname cannot be longer than 20 characters'],
    index: true
  },
  skillLevel: {
    type: Number,
    required: true,
    min: [1, 'Skill level must be at least 1'],
    max: [10, 'Skill level cannot be greater than 10'],
    default: 5
  },
  handedness: {
    type: String,
    enum: {
      values: ['left', 'right', 'ambidextrous'],
      message: '{VALUE} is not a valid handedness'
    },
    default: 'right'
  },
  preferredPosition: {
    type: String,
    enum: {
      values: ['forehand', 'backhand', 'both'],
      message: '{VALUE} is not a valid position'
    },
    default: 'both'
  },
  contactPhone: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s-]+$/.test(v);
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid phone number`
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be longer than 500 characters']
  },
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional field to track who created the player
    index: true
  },
  // Invitation fields
  status: {
    type: String,
    enum: ['invited', 'active', 'inactive'],
    default: 'active'
  },
  invitationSent: {
    type: Boolean,
    default: false
  },
  invitationToken: String,
  invitationExpires: Date
}, {
  timestamps: true
});

// Remove the email requirement - we'll allow players without email or userId as long as they have a nickname
// This enables admin-created players without emails

// Add indexes for performance
playerSchema.index({ nickname: 'text' });
playerSchema.index({ invitationToken: 1 }, { sparse: true }); // For invitation tokens

export const PlayerModel = mongoose.models.Player || mongoose.model<PlayerDocument>('Player', playerSchema);
