import rateLimit from 'express-rate-limit';
import { sendError } from '../shared/response';
import { Request, Response } from 'express';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

function rateLimitHandler(_req: Request, res: Response): void {
  sendError(res, 'Too many requests. Please try again later.', 429);
}

/**
 * Auth rate limiter: 20 requests per 15 minutes in prod, 1000 in dev.
 * Applied to login and forgot-password routes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/**
 * General API rate limiter: 500 requests per 15 minutes in prod, 10000 in dev.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many requests from this IP. Please try again later.',
});

/**
 * AI generation rate limiter: 20 requests per hour in prod, 200 in dev.
 * Applied to AI itinerary generation routes.
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'AI generation limit reached. You can generate up to 20 itineraries per hour.',
});

/**
 * Chat assistant rate limiter: 20 requests per minute in prod, 200 in dev.
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isDev ? 200 : (env.CHAT_RATE_LIMIT || 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Chat rate limit exceeded. Please wait a moment before sending another message.',
});
