import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';

/**
 * GET /api/v1/users/profile
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await usersService.getProfile(authReq.user.id);
    sendSuccess(res, { user }, 'Profile retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/profile
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await usersService.updateProfile(authReq.user.id, req.body);
    sendSuccess(res, { user }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}
