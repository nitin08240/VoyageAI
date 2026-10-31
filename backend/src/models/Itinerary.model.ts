import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IItineraryDocument extends Document {
  userId: Types.ObjectId;
  tripId: Types.ObjectId;
  version: number;
  overview: string;
  destinationMedia?: {
    heroUrl: string;
    thumbUrl?: string;
    photographer?: string;
    photographerUrl?: string;
    sourceUrl?: string;
    gallery?: Array<{
      url: string;
      thumbUrl?: string;
      alt?: string;
      photographer?: string;
      photographerUrl?: string;
    }>;
  };
  days: Array<{
    dayNumber: number;
    date: string;
    title: string;
    morning: IActivitySubdoc[];
    afternoon: IActivitySubdoc[];
    evening: IActivitySubdoc[];
    practicalAdvice: string;
    weather?: IDayWeather;
  }>;
  hotels: Array<{
    name: string;
    location: string;
    category: string;
    priceRange: string;
    facilities: string[];
    whyRecommended: string;
    bookingLink?: string;
    verified: boolean;
    coordinates?: { lat: number; lng: number };
    imageUrl?: string;
    thumbUrl?: string;
    imagePhotographer?: string;
    imagePhotographerUrl?: string;
  }>;
  restaurants: Array<{
    name: string;
    cuisine: string;
    estimatedCost: string;
    dietarySuitability: string[];
    location: string;
    verified: boolean;
    coordinates?: { lat: number; lng: number };
    imageUrl?: string;
    thumbUrl?: string;
    imagePhotographer?: string;
    imagePhotographerUrl?: string;
  }>;
  activities: IActivitySubdoc[];
  budgetBreakdown: {
    accommodation: number;
    food: number;
    transportation: number;
    activities: number;
    shopping: number;
    miscellaneous: number;
    emergencyReserve: number;
    total: number;
  };
  safetyTips: string[];
  packingChecklist: Array<{
    category: string;
    items: string[];
  }>;
  travelTips: string[];
  thingsToAvoid: string[];
  verificationMetadata: {
    generatedBy: string;
    modelVersion: string;
    promptVersion: string;
    validatedAt: Date;
    budgetConsistent: boolean;
    warningFlags: string[];
  };
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDayWeather {
  forecastAvailable: boolean;
  date: string;
  temperature?: number;
  minTemperature?: number;
  maxTemperature?: number;
  condition?: string;
  description?: string;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  recommendations?: string[];
  message?: string;
  lastUpdated?: Date;
}

interface IActivitySubdoc {
  time: string;
  name: string;
  description: string;
  duration: string;
  cost: string;
  travelTime?: string;
  transportation?: string;
  mapLink?: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  thumbUrl?: string;
  imagePhotographer?: string;
  imagePhotographerUrl?: string;
}

const coordinatesSchema = new Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const weatherSchema = new Schema(
  {
    forecastAvailable: { type: Boolean, default: false },
    date: { type: String, required: true },
    temperature: { type: Number },
    minTemperature: { type: Number },
    maxTemperature: { type: Number },
    condition: { type: String },
    description: { type: String },
    icon: { type: String },
    humidity: { type: Number },
    windSpeed: { type: Number },
    rainProbability: { type: Number },
    recommendations: { type: [String], default: [] },
    message: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

const destinationMediaSchema = new Schema(
  {
    heroUrl: { type: String, required: true },
    thumbUrl: { type: String },
    photographer: { type: String },
    photographerUrl: { type: String },
    sourceUrl: { type: String },
    gallery: [
      {
        url: { type: String, required: true },
        thumbUrl: { type: String },
        alt: { type: String },
        photographer: { type: String },
        photographerUrl: { type: String },
      },
    ],
  },
  { _id: false }
);

const activitySchema = new Schema<IActivitySubdoc>(
  {
    time: { type: String, default: 'Flexible' },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: String, default: 'Flexible' },
    cost: { type: String, default: '0' },
    travelTime: { type: String, default: '' },
    transportation: { type: String, default: '' },
    mapLink: { type: String },
    coordinates: { type: coordinatesSchema },
    imageUrl: { type: String },
    thumbUrl: { type: String },
    imagePhotographer: { type: String },
    imagePhotographerUrl: { type: String },
  },
  { _id: false }
);

const daySchema = new Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    morning: { type: [activitySchema], default: [] },
    afternoon: { type: [activitySchema], default: [] },
    evening: { type: [activitySchema], default: [] },
    practicalAdvice: { type: String, default: '' },
    weather: { type: weatherSchema },
  },
  { _id: false }
);

const hotelSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    priceRange: { type: String, required: true },
    facilities: { type: [String], default: [] },
    whyRecommended: { type: String, required: true },
    bookingLink: { type: String },
    verified: { type: Boolean, default: false },
    coordinates: { type: coordinatesSchema },
    imageUrl: { type: String },
    thumbUrl: { type: String },
    imagePhotographer: { type: String },
    imagePhotographerUrl: { type: String },
  },
  { _id: false }
);

const restaurantSchema = new Schema(
  {
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    estimatedCost: { type: String, required: true },
    dietarySuitability: { type: [String], default: [] },
    location: { type: String, required: true },
    verified: { type: Boolean, default: false },
    coordinates: { type: coordinatesSchema },
    imageUrl: { type: String },
    thumbUrl: { type: String },
    imagePhotographer: { type: String },
    imagePhotographerUrl: { type: String },
  },
  { _id: false }
);

const budgetBreakdownSchema = new Schema(
  {
    accommodation: { type: Number, required: true, default: 0 },
    food: { type: Number, required: true, default: 0 },
    transportation: { type: Number, required: true, default: 0 },
    activities: { type: Number, required: true, default: 0 },
    shopping: { type: Number, required: true, default: 0 },
    miscellaneous: { type: Number, required: true, default: 0 },
    emergencyReserve: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const packingItemSchema = new Schema(
  {
    category: { type: String, required: true },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const verificationMetadataSchema = new Schema(
  {
    generatedBy: { type: String, required: true },
    modelVersion: { type: String, required: true },
    promptVersion: { type: String, required: true },
    validatedAt: { type: Date, required: true },
    budgetConsistent: { type: Boolean, required: true },
    warningFlags: { type: [String], default: [] },
  },
  { _id: false }
);

const itinerarySchema = new Schema<IItineraryDocument>(
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
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    overview: {
      type: String,
      required: true,
    },
    destinationMedia: {
      type: destinationMediaSchema,
    },
    days: {
      type: [daySchema],
      default: [],
    },
    hotels: {
      type: [hotelSchema],
      default: [],
    },
    restaurants: {
      type: [restaurantSchema],
      default: [],
    },
    activities: {
      type: [activitySchema],
      default: [],
    },
    budgetBreakdown: {
      type: budgetBreakdownSchema,
      required: true,
    },
    safetyTips: {
      type: [String],
      default: [],
    },
    packingChecklist: {
      type: [packingItemSchema],
      default: [],
    },
    travelTips: {
      type: [String],
      default: [],
    },
    thingsToAvoid: {
      type: [String],
      default: [],
    },
    verificationMetadata: {
      type: verificationMetadataSchema,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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
        delete ret._id;
        return ret;
      },
    },
  }
);

// Indexes
itinerarySchema.index({ tripId: 1, version: -1 });
itinerarySchema.index({ userId: 1 });
itinerarySchema.index({ tripId: 1, userId: 1 });

export const Itinerary = mongoose.model<IItineraryDocument>('Itinerary', itinerarySchema);
