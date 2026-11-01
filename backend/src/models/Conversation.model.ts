import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStructuredCard {
  type: 'place' | 'weather' | 'route' | 'suggestion' | 'itinerary_action';
  data: any;
}

export interface IChatMessageDoc {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  provider?: 'gemini' | 'groq' | 'system';
  model?: string;
  toolCalls?: Array<{
    id?: string;
    name: string;
    args: Record<string, any>;
  }>;
  toolResults?: Array<{
    toolName: string;
    result: any;
  }>;
  structuredCards?: IStructuredCard[];
}

export interface IConversationDocument extends Document {
  userId: Types.ObjectId;
  tripId?: Types.ObjectId | null;
  title: string;
  messages: IChatMessageDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessageDoc>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      enum: ['gemini', 'groq', 'system'],
    },
    model: {
      type: String,
    },
    toolCalls: [
      {
        id: { type: String },
        name: { type: String, required: true },
        args: { type: Schema.Types.Mixed },
      },
    ],
    toolResults: [
      {
        toolName: { type: String, required: true },
        result: { type: Schema.Types.Mixed },
      },
    ],
    structuredCards: [
      {
        type: {
          type: String,
          enum: ['place', 'weather', 'route', 'suggestion', 'itinerary_action'],
          required: true,
        },
        data: { type: Schema.Types.Mixed, required: true },
      },
    ],
  },
  { _id: true }
);

const conversationSchema = new Schema<IConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Travel Conversation',
      maxlength: 120,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, tripId: 1 });

export const Conversation = mongoose.model<IConversationDocument>(
  'Conversation',
  conversationSchema
);

