export interface IActivity {
  id?: string;
  name: string;
  description: string;
  duration: string;
  estimatedCost?: number;
  currency?: string;
  category: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  location?: string;
  coordinates?: ICoordinates;
  transportToNext?: string;
  travelTimeToNext?: string;
  bookingRequired?: boolean;
  bookingUrl?: string;
  tips?: string;
  completed?: boolean;
}

export interface IHotel {
  id?: string;
  name: string;
  location: string;
  city: string;
  category: 'budget' | 'standard' | 'premium' | 'luxury';
  priceRange: string;
  pricePerNight?: number;
  currency?: string;
  facilities: string[];
  whyRecommended: string;
  coordinates?: ICoordinates;
  bookingUrl?: string;
  rating?: number;
  verified?: boolean;
  checkIn?: string;
  checkOut?: string;
}

export interface IRestaurant {
  id?: string;
  name: string;
  cuisine: string;
  costEstimate: string;
  dietaryOptions: string[];
  location: string;
  coordinates?: ICoordinates;
  mustTry?: string;
  timing?: string;
  rating?: number;
  verified?: boolean;
}

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: IActivity[];
  hotel?: IHotel;
  restaurants: IRestaurant[];
  dailyBudget?: number;
  notes?: string;
}

export interface IBudgetBreakdown {
  total: number;
  currency: string;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  perPerson?: number;
  breakdown: IBudgetItem[];
}

export interface IBudgetItem {
  category: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface IPackingItem {
  item: string;
  category: string;
  essential: boolean;
  packed?: boolean;
}

export interface IPackingChecklist {
  categories: IPackingCategory[];
}

export interface IPackingCategory {
  name: string;
  items: IPackingItem[];
}

export interface ISafetyTip {
  category: string;
  tips: string[];
  emergencyNumbers?: IEmergencyNumber[];
}

export interface IEmergencyNumber {
  service: string;
  number: string;
}

export interface IItinerary {
  _id: string;
  tripId: string;
  version?: number;
  overview?: any;
  destination: string;
  totalDays: number;
  days: IItineraryDay[];
  hotels: IHotel[];
  restaurants: IRestaurant[];
  activities?: any[];
  budgetBreakdown: IBudgetBreakdown;
  packingChecklist: IPackingChecklist;
  safetyTips: any[];
  thingsToAvoid?: string[];
  travelTips?: string[];
  generalTips?: string[];
  bestTimeToVisit?: string;
  weatherInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGenerationJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  currentStep?: string;
  error?: string;
  itineraryId?: string;
}
