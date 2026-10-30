import { z } from 'zod';

/* ─── Auth Schemas ──────────────────────────────────────────── */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ─── Trip Wizard Schemas ───────────────────────────────────── */
export const step1DestinationSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  startingLocation: z.string().optional(),
  additionalDestinations: z.array(z.string()).optional(),
});

export const step2DatesSchema = z.object({
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  isFlexible: z.boolean().optional(),
}).refine(data => {
  if (!data.departureDate || !data.returnDate) return true;
  return new Date(data.returnDate) > new Date(data.departureDate);
}, {
  message: 'Return date must be after departure date',
  path: ['returnDate'],
});

export const step3TravellersSchema = z.object({
  type: z.enum(['solo', 'couple', 'friends', 'family', 'business']),
  adults: z.number().min(1, 'At least 1 adult required').max(20),
  children: z.number().min(0).max(10),
});

export const step4BudgetSchema = z.object({
  amount: z.number().min(1, 'Budget amount is required').min(100, 'Minimum budget is 100'),
  currency: z.string().min(1, 'Currency is required'),
  isPerPerson: z.boolean(),
  category: z.enum(['budget', 'comfort', 'luxury']),
});

export const step5InterestsSchema = z.object({
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
});

export const step6AccommodationSchema = z.object({
  accommodation: z.enum(['hostel', 'budget_hotel', 'standard_hotel', 'premium_hotel', 'luxury_resort']),
});

export const step7TransportSchema = z.object({
  transport: z.array(z.string()).min(1, 'Please select at least one transport mode'),
});

export const step8FoodSchema = z.object({
  diet: z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'jain', 'no_preference']),
  restrictions: z.string().optional(),
});

export const step9AdditionalSchema = z.object({
  accessibilityRequired: z.boolean(),
  childrenOrElderly: z.boolean(),
  activityIntensity: z.enum(['relaxed', 'moderate', 'intensive']),
  specialRequests: z.string().optional(),
  sightseeingPace: z.enum(['slow', 'medium', 'fast']),
});

/* ─── Profile Schema ────────────────────────────────────────── */
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  travelStyle: z.enum(['budget', 'comfort', 'luxury']).optional(),
  currency: z.string().optional(),
  food: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  accommodation: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

/* ─── Types ─────────────────────────────────────────────────── */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type Step1Data = z.infer<typeof step1DestinationSchema>;
export type Step2Data = z.infer<typeof step2DatesSchema>;
export type Step3Data = z.infer<typeof step3TravellersSchema>;
export type Step4Data = z.infer<typeof step4BudgetSchema>;
export type Step5Data = z.infer<typeof step5InterestsSchema>;
export type Step6Data = z.infer<typeof step6AccommodationSchema>;
export type Step7Data = z.infer<typeof step7TransportSchema>;
export type Step8Data = z.infer<typeof step8FoodSchema>;
export type Step9Data = z.infer<typeof step9AdditionalSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
