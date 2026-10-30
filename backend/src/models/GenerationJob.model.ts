import mongoose, { Document, Schema, Types } from 'mongoose';
import { JobStatus } from '../shared/types';

export interface IGenerationJobDocument extends Document {
  userId: Types.ObjectId;
  tripId: Types.ObjectId;
  itineraryId?: Types.ObjectId;
  status: JobStatus;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const generationJobSchema = new Schema<IGenerationJobDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    itineraryId: {
      type: Schema.Types.ObjectId,
      ref: 'Itinerary',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    errorCode: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId.toString();
        ret.tripId = ret.tripId.toString();
        if (ret.itineraryId) ret.itineraryId = ret.itineraryId.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes
generationJobSchema.index({ userId: 1, createdAt: -1 });
generationJobSchema.index({ tripId: 1 });
generationJobSchema.index({ status: 1 });

export const GenerationJob = mongoose.model<IGenerationJobDocument>(
  'GenerationJob',
  generationJobSchema
);
