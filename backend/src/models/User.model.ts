import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  profileImage: string;
  preferences: {
    travelStyle: 'budget' | 'mid-range' | 'luxury' | 'adventure' | 'cultural';
    foodPreferences: string[];
    activities: string[];
    accommodation: 'hostel' | 'budget-hotel' | 'mid-range-hotel' | 'luxury-hotel' | 'resort' | 'airbnb';
    currency: string;
  };
  // Password reset fields
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userPreferencesSchema = new Schema(
  {
    travelStyle: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'adventure', 'cultural'],
      default: 'mid-range',
    },
    foodPreferences: {
      type: [String],
      default: [],
    },
    activities: {
      type: [String],
      default: [],
    },
    accommodation: {
      type: String,
      enum: ['hostel', 'budget-hotel', 'mid-range-hotel', 'luxury-hotel', 'resort', 'airbnb'],
      default: 'mid-range-hotel',
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
    // Password reset
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

export const User = mongoose.model<IUserDocument>('User', userSchema);
