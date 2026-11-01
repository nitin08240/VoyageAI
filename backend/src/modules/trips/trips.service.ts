import crypto from 'crypto';
import { Trip, ITripDocument } from '../../models/Trip.model';
import { Itinerary } from '../../models/Itinerary.model';
import { GenerationJob } from '../../models/GenerationJob.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateTripInput, UpdateTripInput } from './trips.validation';
import { ITEMS_PER_PAGE } from '../../config/constants';
import { geocodingService } from '../../services/geocoding.service';

export interface PaginatedTrips {
  trips: ITripDocument[];
  total: number;
}

/**
 * Create a new trip for the authenticated user.
 */
export async function createTrip(
  userId: string,
  data: CreateTripInput
): Promise<ITripDocument> {
  const destName = data.destination.name || data.destination.city || data.destination.country || 'Destination';
  const destCountry = data.destination.country || 'Worldwide';
  const destCity = data.destination.city || data.destination.name || '';
  const startingLocation = data.startingLocation || (data.destination as any).startingLocation || 'Not specified';

  const start = data.dates.start || (data.dates.departureDate ? new Date(data.dates.departureDate) : new Date());
  const end = data.dates.end || (data.dates.returnDate ? new Date(data.dates.returnDate) : new Date(Date.now() + 7 * 86400000));
  const duration = data.duration || Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  let transportStr = data.preferences.transportation || 'mixed';
  if (Array.isArray((data.preferences as any).transport)) {
    transportStr = (data.preferences as any).transport.join(', ');
  } else if (typeof (data.preferences as any).transport === 'string') {
    transportStr = (data.preferences as any).transport;
  }

  let foodStr = 'local';
  if (typeof data.preferences.food === 'string') {
    foodStr = data.preferences.food;
  } else if (data.preferences.food && typeof data.preferences.food === 'object') {
    foodStr = `${(data.preferences.food as any).diet || 'no_preference'} ${(data.preferences.food as any).restrictions ? `(${(data.preferences.food as any).restrictions})` : ''}`.trim();
  }

  let addlStr = data.preferences.additionalRequirements || '';
  if (!addlStr && (data.preferences as any).additional && typeof (data.preferences as any).additional === 'object') {
    addlStr = (data.preferences as any).additional.specialRequests || '';
  }

  // Geocode destination location
  let destCoords: { lat: number; lng: number } | undefined;
  try {
    const geo = await geocodingService.geocode(`${destCity || destName}, ${destCountry}`);
    if (geo) {
      destCoords = { lat: geo.lat, lng: geo.lng };
    }
  } catch (err: any) {
    console.warn('[Trip Destination Geocode Error]', err.message);
  }

  const trip = await Trip.create({
    userId,
    destination: {
      name: destName,
      country: destCountry,
      city: destCity,
      region: data.destination.region || '',
      coordinates: destCoords,
    },
    startingLocation,
    dates: {
      start,
      end,
    },
    duration,
    travellers: {
      adults: data.travellers.adults || 1,
      children: data.travellers.children || 0,
      infants: data.travellers.infants || 0,
    },
    budget: {
      total: data.budget.total ?? (data.budget as any).amount ?? 2000,
      currency: (data.budget.currency || 'USD').toUpperCase(),
      perPerson: data.budget.perPerson ?? (data.budget as any).isPerPerson ?? false,
    },
    preferences: {
      interests: data.preferences.interests || ['culture'],
      accommodation: data.preferences.accommodation || 'mid-range-hotel',
      transportation: transportStr,
      food: foodStr,
      additionalRequirements: addlStr,
    },
    status: data.status || 'draft',
  });
  return trip;
}

/**
 * Get all trips for a user (paginated, newest first).
 */
export async function getTrips(
  userId: string,
  page = 1,
  limit = ITEMS_PER_PAGE
): Promise<PaginatedTrips> {
  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    Trip.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: false }),
    Trip.countDocuments({ userId }),
  ]);

  return { trips: trips as unknown as ITripDocument[], total };
}

/**
 * Get a single trip by ID, validating ownership.
 */
export async function getTripById(
  tripId: string,
  userId: string
): Promise<ITripDocument> {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  if (trip.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have access to this trip.');
  }

  return trip;
}

/**
 * Update a trip (ownership enforced).
 */
export async function updateTrip(
  tripId: string,
  userId: string,
  data: UpdateTripInput
): Promise<ITripDocument> {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  if (trip.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have permission to update this trip.');
  }

  // Prevent overwriting userId from update data
  const { ...safeData } = data as UpdateTripInput & { userId?: unknown };

  Object.assign(trip, safeData);
  await trip.save();

  return trip;
}

/**
 * Delete a trip and all related itineraries and generation jobs.
 */
export async function deleteTrip(
  tripId: string,
  userId: string
): Promise<void> {
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  if (trip.userId.toString() !== userId) {
    throw new ForbiddenError('You do not have permission to delete this trip.');
  }

  await Promise.all([
    Itinerary.deleteMany({ tripId }),
    GenerationJob.deleteMany({ tripId }),
    trip.deleteOne(),
  ]);
}

/**
 * Duplicate an existing trip (creates a new draft).
 */
export async function duplicateTrip(
  tripId: string,
  userId: string
): Promise<ITripDocument> {
  const original = await getTripById(tripId, userId);

  const duplicate = await Trip.create({
    userId,
    destination: original.destination,
    startingLocation: original.startingLocation,
    dates: original.dates,
    duration: original.duration,
    travellers: original.travellers,
    budget: original.budget,
    preferences: original.preferences,
    status: 'draft',
    isShared: false,
  });

  return duplicate;
}

/**
 * Enable sharing for a trip — generates a unique share token.
 */
export async function shareTrip(
  tripId: string,
  userId: string
): Promise<{ shareToken: string }> {
  const trip = await getTripById(tripId, userId);

  if (trip.isShared && trip.shareToken) {
    return { shareToken: trip.shareToken };
  }

  const shareToken = crypto.randomBytes(32).toString('hex');
  trip.shareToken = shareToken;
  trip.isShared = true;
  await trip.save();

  return { shareToken };
}

/**
 * Disable sharing for a trip — removes the share token.
 */
export async function unshareTrip(
  tripId: string,
  userId: string
): Promise<void> {
  const trip = await getTripById(tripId, userId);

  trip.isShared = false;
  trip.shareToken = undefined;
  await trip.save();
}

/**
 * Find a publicly shared trip by its share token (no auth required).
 */
export async function getSharedTrip(shareToken: string): Promise<ITripDocument> {
  const trip = await Trip.findOne({ shareToken, isShared: true });

  if (!trip) {
    throw new NotFoundError('Shared trip not found or sharing has been disabled.');
  }

  return trip;
}
