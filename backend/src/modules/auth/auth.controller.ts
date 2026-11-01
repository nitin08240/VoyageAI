import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { setCookieToken, clearCookieToken } from '../../utils/token';
import { sendSuccess } from '../../shared/response';
import { AuthenticatedRequest } from '../../shared/types';
import { emailService } from '../../services/email.service';
import { AppError } from '../../shared/errors';

/**
 * POST /api/v1/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, token } = await authService.register(req.body);
    setCookieToken(res, token);
    sendSuccess(res, { user }, 'Account created successfully.', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    setCookieToken(res, token);
    sendSuccess(res, { user }, 'Logged in successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    clearCookieToken(res);
    sendSuccess(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user?.id) {
      sendSuccess(res, { user: null }, 'Not authenticated.');
      return;
    }
    const user = await authService.getMe(authReq.user.id);
    sendSuccess(res, { user }, 'Profile retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;
    const { token, userName } = await authService.forgotPassword(email);

    if (token) {
      const delivered = await emailService.sendPasswordResetEmail(email, userName, token);
      if (!delivered) {
        // Invalidate token immediately if delivery failed
        await authService.clearResetToken(email);
        if (process.env.NODE_ENV === 'production' && !emailService.isConfigured()) {
          throw new AppError('Email service is currently unavailable. Please try again later.', 503);
        }
      }
    }

    sendSuccess(
      res,
      null,
      'If an account with that email exists, you will receive a password reset link shortly.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    clearCookieToken(res); // Force re-login after password reset
    sendSuccess(res, null, 'Password reset successfully. Please log in with your new password.');
  } catch (err) {
    next(err);
  }
}
