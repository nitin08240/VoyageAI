import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config/constants';

/**
 * Hashes a plain-text password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(plain, salt);
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 */
export async function comparePassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
