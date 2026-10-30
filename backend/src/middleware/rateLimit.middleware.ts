import rateLimit from 'express-rate-limit';
import { sendError } from '../shared/response';
import { Request, Response } from 'express';

function rateLimitHandler(_req: Request, res: Response): void {
  sendError(res, 'Too many requests. Please try again later.', 429);
}

/**
 * Auth rate limiter: 5 requests per 15 minutes.
 * Applied to login and forgot-password routes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many requests from this IP. Please try again later.',
});

/**
 * AI generation rate limiter: 10 requests per hour.
 * Applied to AI itinerary generation routes.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'AI generation limit reached. You can generate up to 10 itineraries per hour.',
});
