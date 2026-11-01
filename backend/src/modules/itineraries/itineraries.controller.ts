import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { Itinerary } from '../../models/Itinerary.model';
import { Trip } from '../../models/Trip.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import { sendSuccess } from '../../shared/response';
import { geocodingService } from '../../services/geocoding.service';
import { unsplashService } from '../../services/unsplash.service';
import { weatherService } from '../../services/weather.service';

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

    // Auto-enrich images and weather if missing or empty
    const destName = trip.destination?.city || trip.destination?.name || 'Destination';
    let needsSave = false;

    // Check if geocodes are missing or out-of-region
    const hasOutdatedCoordinates =
      !itinerary.destinationCoordinates ||
      (itinerary.hotels?.[0]?.coordinates?.lat === 35.0116 && !destName.toLowerCase().includes('kyoto'));

    if (hasOutdatedCoordinates) {
      try {
        const geoModified = await geocodingService.geocodeItinerary(itinerary, destName);
        if (geoModified) needsSave = true;
      } catch (err: any) {
        console.warn('[Auto-Geocode Check]', err.message);
      }
    }

    const coords = itinerary.destinationCoordinates || itinerary.hotels?.[0]?.coordinates || (itinerary.days?.[0] as any)?.morning?.[0]?.coordinates;

    if (!itinerary.destinationMedia?.heroUrl) {
      try {
        const imgModified = await unsplashService.enrichItineraryImages(itinerary, destName);
        if (imgModified) needsSave = true;
      } catch (err: any) {
        console.warn('[Auto-Enrich Images]', err.message);
      }
    }

    if (!itinerary.days?.[0]?.weather) {
      try {
        const weatherModified = await weatherService.enrichItineraryWeather(itinerary, destName, coords);
        if (weatherModified) needsSave = true;
      } catch (err: any) {
        console.warn('[Auto-Enrich Weather]', err.message);
      }
    }

    if (needsSave) {
      try {
        itinerary.markModified('destinationMedia');
        itinerary.markModified('days');
        itinerary.markModified('hotels');
        itinerary.markModified('restaurants');
        await itinerary.save();
      } catch (saveErr: any) {
        console.warn('[Auto-Enrich Save Non-blocking Notice]:', saveErr.message);
      }
    }

    sendSuccess(res, { itinerary, trip }, 'Itinerary retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/itineraries/:tripId/enrich-media
 * Explicitly triggers Unsplash image fetching and OpenWeather updates for an itinerary.
 */
export async function enrichItineraryMedia(
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
      throw new NotFoundError('No itinerary found for this trip.');
    }

    const destName = trip.destination?.city || trip.destination?.name || 'Destination';
    const coords = itinerary.hotels?.[0]?.coordinates || (itinerary.days?.[0] as any)?.morning?.[0]?.coordinates;

    await unsplashService.enrichItineraryImages(itinerary, destName);
    await weatherService.enrichItineraryWeather(itinerary, destName, coords);

    itinerary.markModified('destinationMedia');
    itinerary.markModified('days');
    itinerary.markModified('hotels');
    itinerary.markModified('restaurants');
    await itinerary.save();

    sendSuccess(res, { itinerary, trip }, 'Itinerary media and weather refreshed successfully');
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
