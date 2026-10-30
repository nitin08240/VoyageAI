import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response, CookieOptions } from 'express';
import { env } from '../config/env';
import { COOKIE_NAME } from '../config/constants';
import { AuthError } from '../shared/errors';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN || '7d';
const IS_PROD = env.NODE_ENV === 'production';

/**
 * Signs a JWT token with the application secret.
 */
export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies and decodes a JWT token.
 * Throws AuthError for invalid or expired tokens.
 */
export function verifyToken(token: string): jwt.JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
      throw new AuthError('Invalid token format.');
    }
    return decoded;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw err; // Let error middleware handle TokenExpiredError / JsonWebTokenError
  }
}

/**
 * Generates a cryptographically secure random reset token.
 * Returns [plainToken, hashedToken] tuple.
 */
export function generateResetToken(): [string, string] {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');
  return [plainToken, hashedToken];
}

/**
 * Sets the JWT cookie on the response.
 */
export function setCookieToken(res: Response, token: string): void {
  const expiresMs = parseExpiry(JWT_EXPIRES_IN);

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: expiresMs,
    path: '/',
  };

  if (IS_PROD && env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.cookie(COOKIE_NAME, token, cookieOptions);
}

/**
 * Clears the JWT cookie from the response.
 */
export function clearCookieToken(res: Response): void {
  const cookieOptions: Parameters<Response['clearCookie']>[1] = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    path: '/',
  };

  if (IS_PROD && env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.clearCookie(COOKIE_NAME, cookieOptions);
}

/**
 * Parses a JWT expiry string like "7d", "24h", "3600" into milliseconds.
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd]?)$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2] || 's';

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:  return value * 1000;
  }
}
