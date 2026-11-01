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

/**
 * POST /api/v1/users/contact
 */
export async function submitContact(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Please provide a valid name (at least 2 characters).' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      res.status(400).json({ success: false, message: 'Message must be at least 10 characters long.' });
      return;
    }

    console.log(`[Contact] New inquiry from ${name.trim()} (${email.trim()}) - Subject: ${subject || 'General'}`);
    sendSuccess(
      res,
      { received: true, submittedAt: new Date().toISOString() },
      'Your message has been sent successfully. Our team will review it and reply within 24-48 business hours.',
      200
    );
  } catch (err) {
    next(err);
  }
}
