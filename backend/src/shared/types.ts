import { Request } from 'express';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUserPreferences {
  travelStyle: 'budget' | 'mid-range' | 'luxury' | 'adventure' | 'cultural';
  foodPreferences: string[];
  activities: string[];
  accommodation: 'hostel' | 'budget-hotel' | 'mid-range-hotel' | 'luxury-hotel' | 'resort' | 'airbnb';
  currency: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: IUserPreferences;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export interface ITripDestination {
  name: string;
  country: string;
  city?: string;
  region?: string;
}

export interface ITripDates {
  start: Date;
  end: Date;
}

export interface ITripTravellers {
  adults: number;
  children: number;
  infants: number;
}

export interface ITripBudget {
  total: number;
  currency: string;
  perPerson?: boolean;
}

export interface ITripPreferences {
  interests: string[];
  accommodation: string;
  transportation: string;
  food: string;
  additionalRequirements?: string;
}

export type TripStatus = 'draft' | 'saved' | 'generating' | 'completed' | 'failed';

export interface ITrip {
  id: string;
  userId: string;
  destination: ITripDestination;
  startingLocation: string;
  dates: ITripDates;
  duration: number; // in days
  travellers: ITripTravellers;
  budget: ITripBudget;
  preferences: ITripPreferences;
  status: TripStatus;
  shareToken?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Itinerary Sub-Types ──────────────────────────────────────────────────────
export interface IActivity {
  time: string;
  name: string;
  description: string;
  duration: string;
  cost: string;
  travelTime?: string;
  transportation?: string;
  mapLink?: string;
}

export interface ITripDay {
  dayNumber: number;
  date: string;
  title: string;
  morning: IActivity[];
  afternoon: IActivity[];
  evening: IActivity[];
  practicalAdvice: string;
}

export interface IHotel {
  name: string;
  location: string;
  category: string;
  priceRange: string;
  facilities: string[];
  whyRecommended: string;
  bookingLink?: string;
  verified: boolean;
}

export interface IRestaurant {
  name: string;
  cuisine: string;
  estimatedCost: string;
  dietarySuitability: string[];
  location: string;
  verified: boolean;
}

export interface IBudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  emergencyReserve: number;
  total: number;
}

export interface IPackingItem {
  category: string;
  items: string[];
}

export interface IVerificationMetadata {
  generatedBy: string;
  modelVersion: string;
  promptVersion: string;
  validatedAt: Date;
  budgetConsistent: boolean;
  warningFlags: string[];
}

// ─── Itinerary ────────────────────────────────────────────────────────────────
export interface IItinerary {
  id: string;
  userId: string;
  tripId: string;
  version: number;
  overview: string;
  days: ITripDay[];
  hotels: IHotel[];
  restaurants: IRestaurant[];
  activities: IActivity[];
  budgetBreakdown: IBudgetBreakdown;
  safetyTips: string[];
  packingChecklist: IPackingItem[];
  travelTips: string[];
  thingsToAvoid: string[];
  verificationMetadata: IVerificationMetadata;
  generatedAt: Date;
}

// ─── Generation Job ───────────────────────────────────────────────────────────
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IGenerationJob {
  id: string;
  userId: string;
  tripId: string;
  status: JobStatus;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  startedAt: Date;
  completedAt?: Date;
  itineraryId?: string;
}

// ─── Express Augmentation ─────────────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}
