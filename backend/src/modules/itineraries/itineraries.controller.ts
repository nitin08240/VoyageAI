import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { Itinerary } from '../../models/Itinerary.model';
import { Trip } from '../../models/Trip.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { sendSuccess } from '../../shared/response';
import { geocodingService } from '../../services/geocoding.service';

/**
 * GET /api/v1/itineraries/:tripId
 * Get the latest itinerary for a trip.
 */
export async function getItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.tripId as string;
    const userId = authReq.user.id;

    // Verify trip ownership
    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Trip not found.');
    if (trip.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this trip.');
    }

    const itinerary = await Itinerary.findOne({ tripId, userId })
      .sort({ version: -1 });

    if (!itinerary) {
      throw new NotFoundError('No itinerary found for this trip.');
    }

    sendSuccess(res, { itinerary, trip }, 'Itinerary retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/itineraries/:tripId/geocode
 * Batch-geocode missing coordinates for all locations in an itinerary.
 */
export async function geocodeItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.tripId as string;
    const userId = authReq.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Trip not found.');
    if (trip.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this trip.');
    }

    const itinerary = await Itinerary.findOne({ tripId, userId }).sort({ version: -1 });
    if (!itinerary) {
      throw new NotFoundError('No itinerary found to geocode.');
    }

    const destContext = trip.destination?.city || trip.destination?.name || 'City';
    const modified = await geocodingService.geocodeItinerary(itinerary, destContext);

    if (modified) {
      itinerary.markModified('hotels');
      itinerary.markModified('restaurants');
      itinerary.markModified('days');
      await itinerary.save();
    }

    sendSuccess(res, { itinerary, modified }, 'Geocoding completed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/itineraries/:id
 * Update an itinerary (e.g., mark activities complete, add notes).
 */
export async function updateItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const userId = authReq.user.id;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) throw new NotFoundError('Itinerary not found.');
    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to update this itinerary.');
    }

    // Allow updating specific fields
    const allowedFields = ['days', 'hotels', 'restaurants', 'activities', 'safetyTips', 'packingChecklist', 'travelTips', 'thingsToAvoid'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (itinerary as any)[field] = req.body[field];
      }
    }

    await itinerary.save();
    sendSuccess(res, itinerary, 'Itinerary updated');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/itineraries/:id/export
 * Return itinerary data formatted for PDF export.
 */
export async function exportItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const userId = authReq.user.id;

    const itinerary = await Itinerary.findById(id);
    if (!itinerary) throw new NotFoundError('Itinerary not found.');
    if (itinerary.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to export this itinerary.');
    }

    const trip = await Trip.findById(itinerary.tripId);

    sendSuccess(res, { itinerary, trip }, 'Export data ready');
  } catch (error) {
    next(error);
  }
}
