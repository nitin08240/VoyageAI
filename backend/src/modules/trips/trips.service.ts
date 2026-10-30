import crypto from 'crypto';
import { Trip, ITripDocument } from '../../models/Trip.model';
import { Itinerary } from '../../models/Itinerary.model';
import { GenerationJob } from '../../models/GenerationJob.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { CreateTripInput, UpdateTripInput } from './trips.validation';
import { ITEMS_PER_PAGE } from '../../config/constants';

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
  const trip = await Trip.create({
    ...data,
    userId,
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
