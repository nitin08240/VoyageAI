import mongoose, { Document, Schema, Types } from 'mongoose';
import { TripStatus } from '../shared/types';

export interface ITripDocument extends Document {
  userId: Types.ObjectId;
  destination: {
    name: string;
    country: string;
    city?: string;
    region?: string;
  };
  startingLocation: string;
  dates: {
    start: Date;
    end: Date;
  };
  duration: number;
  travellers: {
    adults: number;
    children: number;
    infants: number;
  };
  budget: {
    total: number;
    currency: string;
    perPerson: boolean;
  };
  preferences: {
    interests: string[];
    accommodation: string;
    transportation: string;
    food: string;
    additionalRequirements?: string;
  };
  status: TripStatus;
  shareToken?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const destinationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },
  },
  { _id: false }
);

const datesSchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const travellersSchema = new Schema(
  {
    adults: { type: Number, required: true, min: 1, default: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const budgetSchema = new Schema(
  {
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD', uppercase: true },
    perPerson: { type: Boolean, default: false },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    interests: { type: [String], default: [] },
    accommodation: { type: String, default: 'mid-range-hotel' },
    transportation: { type: String, default: 'mixed' },
    food: { type: String, default: 'local' },
    additionalRequirements: { type: String, default: '' },
  },
  { _id: false }
);

const tripSchema = new Schema<ITripDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: destinationSchema,
      required: true,
    },
    startingLocation: {
      type: String,
      required: true,
      trim: true,
    },
    dates: {
      type: datesSchema,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    travellers: {
      type: travellersSchema,
      default: () => ({}),
    },
    budget: {
      type: budgetSchema,
      required: true,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'saved', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    shareToken: {
      type: String,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes
tripSchema.index({ userId: 1, createdAt: -1 });
tripSchema.index({ shareToken: 1 }, { sparse: true, unique: true });
tripSchema.index({ status: 1 });

export const Trip = mongoose.model<ITripDocument>('Trip', tripSchema);
