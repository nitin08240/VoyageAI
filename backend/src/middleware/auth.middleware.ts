import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { AuthError } from '../shared/errors';
import { COOKIE_NAME } from '../config/constants';
import { AuthenticatedRequest } from '../shared/types';

/**
 * Strict authentication middleware.
 * Throws AuthError if no valid JWT cookie is present.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthError('No authentication token provided. Please log in.');
    }

    const decoded = verifyToken(token) as { id: string; email: string; iat: number; exp: number };

    if (!decoded?.id || !decoded?.email) {
      throw new AuthError('Invalid authentication token payload.');
    }

    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional authentication middleware.
 * Attaches user to request if a valid JWT cookie or Bearer token exists.
 * Does NOT throw if missing or invalid — just calls next().
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token) as { id: string; email: string };

    if (decoded?.id && decoded?.email) {
      (req as AuthenticatedRequest).user = {
        id: decoded.id,
        email: decoded.email,
      };
    }
  } catch {
    // Silently ignore token errors — optional auth
  }

  next();
}
