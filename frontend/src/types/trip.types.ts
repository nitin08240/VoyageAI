export enum ITripStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IDestination {
  country: string;
  city: string;
  startingLocation?: string;
  additionalDestinations?: string[];
}

export interface ITravelDates {
  departureDate: string;
  returnDate: string;
  duration?: number;
  isFlexible?: boolean;
}

export interface ITravellers {
  type: 'solo' | 'couple' | 'friends' | 'family' | 'business';
  adults: number;
  children: number;
}

export interface IBudget {
  amount: number;
  currency: string;
  isPerPerson: boolean;
  category: 'budget' | 'comfort' | 'luxury';
}

export interface IPreferences {
  interests: string[];
  accommodation: 'hostel' | 'budget_hotel' | 'standard_hotel' | 'premium_hotel' | 'luxury_resort';
  transport: string[];
  food: {
    diet: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'jain' | 'no_preference';
    restrictions?: string;
  };
  additional: {
    accessibilityRequired: boolean;
    childrenOrElderly: boolean;
    activityIntensity: 'relaxed' | 'moderate' | 'intensive';
    specialRequests?: string;
    sightseeingPace: 'slow' | 'medium' | 'fast';
  };
}

export interface ITrip {
  _id: string;
  userId: string;
  title?: string;
  destination: IDestination;
  dates: ITravelDates;
  travellers: ITravellers;
  budget: IBudget;
  preferences: IPreferences;
  status: ITripStatus;
  itineraryId?: string;
  jobId?: string;
  shareToken?: string;
  isShared?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTripPayload {
  destination: IDestination;
  dates: ITravelDates;
  travellers: ITravellers;
  budget: IBudget;
  preferences: IPreferences;
}

export interface ITripCard {
  _id: string;
  title?: string;
  destination: IDestination;
  dates: ITravelDates;
  travellers: ITravellers;
  budget: IBudget;
  status: ITripStatus;
  createdAt: string;
}
