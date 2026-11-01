import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { AuthError } from '../shared/errors';
import { COOKIE_NAME } from '../config/constants';
import { AuthenticatedRequest } from '../shared/types';
import { User } from '../models/User.model';

/**
 * Strict cookie-only authentication middleware.
 * Throws AuthError if no valid JWT cookie is present.
 * Bearer token fallback is explicitly rejected for security.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new AuthError('No authentication token provided. Please log in.');
    }

    const decoded = verifyToken(token) as {
      id: string;
      email: string;
      tokenVersion?: number;
      iat: number;
      exp: number;
    };

    if (!decoded?.id || !decoded?.email) {
      throw new AuthError('Invalid authentication token payload.');
    }

    // Verify session validity against database tokenVersion if set
    if (typeof decoded.tokenVersion === 'number') {
      const userDoc = await User.findById(decoded.id).select('tokenVersion');
      if (!userDoc || (userDoc.tokenVersion || 0) !== decoded.tokenVersion) {
        throw new AuthError('Session has expired due to a credential change. Please log in again.');
      }
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
 * Attaches user to request if a valid JWT cookie exists.
 * Does NOT accept Bearer tokens; does NOT throw if cookie is absent.
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token) as {
      id: string;
      email: string;
      tokenVersion?: number;
    };

    if (decoded?.id && decoded?.email) {
      if (typeof decoded.tokenVersion === 'number') {
        const userDoc = await User.findById(decoded.id).select('tokenVersion');
        if (!userDoc || (userDoc.tokenVersion || 0) !== decoded.tokenVersion) {
          return next();
        }
      }

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
