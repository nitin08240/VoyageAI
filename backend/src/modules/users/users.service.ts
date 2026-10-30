import { User, IUserDocument } from '../../models/User.model';
import { NotFoundError } from '../../shared/errors';

export interface UpdateProfileData {
  name?: string;
  profileImage?: string;
  preferences?: {
    travelStyle?: 'budget' | 'mid-range' | 'luxury' | 'adventure' | 'cultural';
    foodPreferences?: string[];
    activities?: string[];
    accommodation?: 'hostel' | 'budget-hotel' | 'mid-range-hotel' | 'luxury-hotel' | 'resort' | 'airbnb';
    currency?: string;
  };
}

/**
 * Get a user's public profile by ID.
 */
export async function getProfile(userId: string): Promise<IUserDocument> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found.');
  }
  return user;
}

/**
 * Update a user's profile.
 * Email and password changes are NOT allowed through this service.
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<IUserDocument> {
  // Strict whitelist — never allow email or password via this path
  const allowedUpdate: UpdateProfileData = {};

  if (data.name !== undefined) allowedUpdate.name = data.name;
  if (data.profileImage !== undefined) allowedUpdate.profileImage = data.profileImage;
  if (data.preferences !== undefined) {
    allowedUpdate.preferences = {};
    const prefs = data.preferences;
    if (prefs.travelStyle !== undefined) allowedUpdate.preferences.travelStyle = prefs.travelStyle;
    if (prefs.foodPreferences !== undefined) allowedUpdate.preferences.foodPreferences = prefs.foodPreferences;
    if (prefs.activities !== undefined) allowedUpdate.preferences.activities = prefs.activities;
    if (prefs.accommodation !== undefined) allowedUpdate.preferences.accommodation = prefs.accommodation;
    if (prefs.currency !== undefined) allowedUpdate.preferences.currency = prefs.currency;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdate },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('User not found. Cannot update profile.');
  }

  return user;
}
