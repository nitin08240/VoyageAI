import crypto from 'crypto';
import { User, IUserDocument } from '../../models/User.model';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken, generateResetToken } from '../../utils/token';
import { ConflictError, AuthError, NotFoundError } from '../../shared/errors';
import { RegisterInput, LoginInput } from './auth.validation';
import { PASSWORD_RESET_EXPIRY_MS } from '../../config/constants';

export interface AuthResult {
  user: Omit<IUserDocument, 'passwordHash' | 'passwordResetToken' | 'passwordResetExpires'>;
  token: string;
}

/**
 * Register a new user.
 */
export async function register(data: RegisterInput): Promise<AuthResult> {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ConflictError('An account with this email address already exists.');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
  });

  const token = signToken({ id: user._id.toString(), email: user.email });

  return {
    user: user.toJSON() as unknown as IUserDocument,
    token,
  };
}

/**
 * Login an existing user.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  // Explicitly select passwordHash since it has select: false
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new AuthError('Invalid email or password.');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError('Invalid email or password.');
  }

  const token = signToken({ id: user._id.toString(), email: user.email });

  // Return user without sensitive fields
  const safeUser = await User.findById(user._id);
  if (!safeUser) throw new AuthError('User not found.');

  return {
    user: safeUser.toJSON() as unknown as IUserDocument,
    token,
  };
}

/**
 * Initiate a forgot password flow.
 * Returns the plain reset token to be sent via email.
 */
export async function forgotPassword(email: string): Promise<{ token: string; userName: string }> {
  const user = await User.findOne({ email });

  // Always respond generically to prevent email enumeration
  if (!user) {
    return { token: '', userName: '' };
  }

  const [plainToken, hashedToken] = generateResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  return { token: plainToken, userName: user.name };
}

/**
 * Reset the user's password using a valid reset token.
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new AuthError('Password reset token is invalid or has expired. Please request a new one.');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
}

/**
 * Get authenticated user profile by ID.
 */
export async function getMe(userId: string): Promise<IUserDocument> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User account not found.');
  }
  return user;
}
