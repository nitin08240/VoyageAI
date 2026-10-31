export interface GeoCoordinates {
  lat: number;
  lng: number;
}

export type MarkerCategory = 'destination' | 'attraction' | 'hotel' | 'restaurant' | 'activity';

export type VerificationStatus = 'verified' | 'unverified' | 'geocoded';

export interface MapLocation {
  locationId: string;
  name: string;
  category: MarkerCategory;
  description?: string;
  coordinates?: GeoCoordinates;
  address?: string;
  dayNumber?: number;
  timeSlot?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  estimatedDuration?: string;
  estimatedCost?: number | string;
  verificationStatus: VerificationStatus;
  externalUrl?: string;
}

export type MapCategoryFilter = 'all' | 'destination' | 'attraction' | 'hotel' | 'restaurant' | 'activity';

export interface RouteWaypoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteData {
  geometry: [number, number][]; // [lat, lng] array for Leaflet polyline
  distanceKm: number;
  durationMin: number;
  waypoints: RouteWaypoint[];
  provider: 'osrm' | 'direct-fallback';
}

export interface TravelMapProps {
  itinerary?: any;
  destination?: string;
  destinationName?: string;
  hotels?: any[];
  restaurants?: any[];
  activities?: any[];
  selectedDay?: number | null;
  selectedLocationId?: string | null;
  onLocationSelect?: (locationId: string) => void;
  height?: string;
  interactive?: boolean;
}
