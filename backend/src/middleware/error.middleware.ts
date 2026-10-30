import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError, AuthError, ValidationError } from '../shared/errors';
import { sendError } from '../shared/response';
import { env } from '../config/env';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

function formatZodErrors(err: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  err.errors.forEach((issue) => {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) formatted[path] = [];
    formatted[path].push(issue.message);
  });
  return formatted;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProd = env.NODE_ENV === 'production';

  // ── Operational App Errors ──────────────────────────────────────────────────
  if (err instanceof AppError) {
    if (err instanceof ValidationError && err.errors) {
      sendError(res, err.message, err.statusCode, err.errors);
    } else {
      sendError(res, err.message, err.statusCode);
    }
    return;
  }

  // ── Zod Validation Errors ───────────────────────────────────────────────────
  if (err instanceof ZodError) {
    sendError(
      res,
      'Validation failed',
      400,
      formatZodErrors(err)
    );
    return;
  }

  // ── JWT Errors ──────────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    const authErr = new AuthError('Your session has expired. Please log in again.');
    sendError(res, authErr.message, authErr.statusCode);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    const authErr = new AuthError('Invalid authentication token. Please log in again.');
    sendError(res, authErr.message, authErr.statusCode);
    return;
  }

  // ── Mongoose Validation Error ───────────────────────────────────────────────
  if (err instanceof MongooseError.ValidationError) {
    const errors: Record<string, string[]> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = [err.errors[key].message];
    });
    sendError(res, 'Database validation failed', 400, errors);
    return;
  }

  // ── Mongoose CastError (bad ObjectId) ──────────────────────────────────────
  if (err instanceof MongooseError.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
    return;
  }

  // ── MongoDB Duplicate Key Error (code 11000) ────────────────────────────────
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue || {})[0] || 'field';
    sendError(res, `A record with this ${field} already exists.`, 409);
    return;
  }

  // ── Unknown / Unexpected Errors ─────────────────────────────────────────────
  if (!isProd && err instanceof Error) {
    console.error('💥 Unhandled error:', err);
    sendError(res, err.message, 500);
  } else {
    console.error('💥 Unhandled error:', err);
    sendError(res, 'An unexpected error occurred. Please try again later.', 500);
  }
}
