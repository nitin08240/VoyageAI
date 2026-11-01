import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import { sendSuccess } from '../../shared/response';
import { Trip } from '../../models/Trip.model';
import { GenerationJob } from '../../models/GenerationJob.model';
import { Itinerary } from '../../models/Itinerary.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors';
import * as aiService from './ai.service';

/**
 * POST /api/v1/ai/generate
 * Start itinerary generation for a trip.
 */
export async function generateItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tripId } = req.body;
    const userId = authReq.user.id;

    // Validate trip exists and is owned
    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Trip not found.');
    if (trip.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this trip.');
    }

    // Update trip status
    trip.status = 'generating';
    await trip.save();

    // Create generation job
    const job = await GenerationJob.create({
      userId,
      tripId,
      status: 'pending',
      startedAt: new Date(),
    });

    // Kick off generation in background (don't await)
    aiService.generateItinerary(tripId, userId, job._id.toString()).catch((err) => {
      console.error('[AI Controller] Background generation failed:', err.message);
    });

    sendSuccess(res, { jobId: job._id, tripId, status: 'pending' }, 'Generation started', 202);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/ai/jobs/:jobId
 * Poll generation job status.
 */
export async function getJobStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const jobId = req.params.jobId as string;
    const userId = authReq.user.id;

    const job = await GenerationJob.findById(jobId);
    if (!job) throw new NotFoundError('Generation job not found.');
    if (job.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this job.');
    }

    const responseData: any = {
      jobId: job._id,
      tripId: job.tripId,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };

    // If completed, include the itinerary ID
    if (job.status === 'completed') {
      const itinerary = await Itinerary.findOne({ tripId: job.tripId })
        .sort({ version: -1 })
        .select('_id version');
      if (itinerary) {
        responseData.itineraryId = itinerary._id;
        responseData.version = itinerary.version;
      }
    }

    if (job.status === 'failed') {
      responseData.errorMessage = job.errorMessage || 'Generation failed. Please try again.';
      responseData.error = responseData.errorMessage;
    }

    sendSuccess(res, responseData, 'Job status retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/ai/regenerate
 * Regenerate itinerary for an existing trip (creates new version).
 */
export async function regenerateItinerary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { tripId } = req.body;
    const userId = authReq.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('Trip not found.');
    if (trip.userId.toString() !== userId) {
      throw new ForbiddenError('You do not have access to this trip.');
    }

    trip.status = 'generating';
    await trip.save();

    const job = await GenerationJob.create({
      userId,
      tripId,
      status: 'pending',
      startedAt: new Date(),
    });

    aiService.generateItinerary(tripId, userId, job._id.toString()).catch((err) => {
      console.error('[AI Controller] Background regeneration failed:', err.message);
    });

    sendSuccess(res, { jobId: job._id, tripId, status: 'pending' }, 'Regeneration started', 202);
  } catch (error) {
    next(error);
  }
}
