import { Request, Response, NextFunction, CookieOptions } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { sendSuccess } from '../shared/response';

const IS_PROD = env.NODE_ENV === 'production';
const CSRF_COOKIE_NAME = '_csrf_hmac';

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

/**
 * Generates a cryptographically secure random token and its HMAC signature.
 */
export function generateCsrfPair(): { token: string; hmac: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hmac = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(token)
    .digest('hex');
  return { token, hmac };
}

/**
 * Endpoint handler: GET /api/v1/auth/csrf-token
 * Sets HttpOnly HMAC cookie and returns raw token to client.
 */
export function issueCsrfToken(_req: Request, res: Response): void {
  const { token, hmac } = generateCsrfPair();

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };

  if (IS_PROD && env.COOKIE_DOMAIN) {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }

  res.cookie(CSRF_COOKIE_NAME, hmac, cookieOptions);
  sendSuccess(res, { csrfToken: token }, 'CSRF token issued successfully.');
}

/**
 * CSRF Protection Middleware
 * Validates Origin/Referer and checks HMAC-signed CSRF token on state-changing requests.
 */
export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const method = req.method.toUpperCase();

  // 1. Safe HTTP methods require no CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // 2. Unauthenticated auth bootstrapping endpoints are exempt
  const currentPath = (req.originalUrl || req.url || req.path || '').split('?')[0];
  const exemptPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/forgot-password',
    '/api/v1/auth/reset-password',
    '/api/v1/auth/csrf-token',
  ];

  if (exemptPaths.some((p) => currentPath.startsWith(p))) {
    return next();
  }

  // 3. Origin / Referer validation (Defense-in-depth)
  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;
  const requestOrigin = originHeader || (refererHeader ? new URL(refererHeader).origin : null);

  if (requestOrigin) {
    const isAllowed =
      allowedOrigins.includes(requestOrigin) ||
      (!IS_PROD &&
        (/^http:\/\/localhost:\d+$/.test(requestOrigin) ||
          /^http:\/\/127\.0\.0\.1:\d+$/.test(requestOrigin)));

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        message: 'CSRF validation error: Forbidden request origin.',
      });
      return;
    }
  }

  // 4. Token validation
  const clientToken = (req.headers['x-csrf-token'] || req.headers['x-xsrf-token']) as string | undefined;
  const cookieHmac = req.cookies?.[CSRF_COOKIE_NAME] as string | undefined;

  if (!clientToken || !cookieHmac) {
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed: Token or cookie missing. Please refresh.',
    });
    return;
  }

  const expectedHmac = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(clientToken)
    .digest('hex');

  const clientBuf = Buffer.from(cookieHmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (clientBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(clientBuf, expectedBuf)) {
    res.status(403).json({
      success: false,
      message: 'CSRF validation failed: Invalid token.',
    });
    return;
  }

  next();
}

