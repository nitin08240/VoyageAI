import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../shared/types';
import * as tripsService from './trips.service';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const trip = await tripsService.createTrip(authReq.user.id, req.body);
    sendSuccess(res, trip, 'Trip created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getTrips(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

    const { trips, total } = await tripsService.getTrips(authReq.user.id, page, limit);
    sendPaginated(res, trips, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getTripById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    const trip = await tripsService.getTripById(tripId, authReq.user.id);
    sendSuccess(res, trip, 'Trip retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    const trip = await tripsService.updateTrip(tripId, authReq.user.id, req.body);
    sendSuccess(res, trip, 'Trip updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    await tripsService.deleteTrip(tripId, authReq.user.id);
    sendSuccess(res, null, 'Trip deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function duplicateTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    const trip = await tripsService.duplicateTrip(tripId, authReq.user.id);
    sendSuccess(res, trip, 'Trip duplicated successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function shareTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    const result = await tripsService.shareTrip(tripId, authReq.user.id);
    sendSuccess(res, result, 'Trip shared successfully');
  } catch (error) {
    next(error);
  }
}

export async function unshareTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const tripId = req.params.id as string;
    await tripsService.unshareTrip(tripId, authReq.user.id);
    sendSuccess(res, null, 'Trip sharing revoked successfully');
  } catch (error) {
    next(error);
  }
}

export async function getSharedTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token as string;
    const trip = await tripsService.getSharedTrip(token);
    sendSuccess(res, trip, 'Shared trip retrieved successfully');
  } catch (error) {
    next(error);
  }
}
