import { z } from 'zod';

const destinationSchema = z.object({
  name: z.string().min(1, 'Destination name is required').trim(),
  country: z.string().min(1, 'Country is required').trim(),
  city: z.string().trim().optional(),
  region: z.string().trim().optional(),
});

const datesSchema = z.object({
  start: z.coerce.date({ required_error: 'Start date is required' }),
  end: z.coerce.date({ required_error: 'End date is required' }),
}).refine((d) => d.end > d.start, {
  message: 'End date must be after start date',
  path: ['end'],
});

const travellersSchema = z.object({
  adults: z.number().int().min(1, 'At least 1 adult is required').default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
});

const budgetSchema = z.object({
  total: z.number().positive('Budget must be a positive number'),
  currency: z.string().min(3).max(3, 'Currency must be a 3-letter code').default('USD').transform(c => c.toUpperCase()),
  perPerson: z.boolean().default(false),
});

const interestsEnum = z.enum([
  'culture',
  'history',
  'adventure',
  'nature',
  'beaches',
  'food',
  'nightlife',
  'shopping',
  'art',
  'architecture',
  'sports',
  'wellness',
  'photography',
  'family',
  'romance',
]);

const accommodationEnum = z.enum([
  'hostel',
  'budget-hotel',
  'mid-range-hotel',
  'luxury-hotel',
  'resort',
  'airbnb',
  'boutique-hotel',
  'camping',
]);

const transportationEnum = z.enum([
  'public-transit',
  'rental-car',
  'taxi-rideshare',
  'walking',
  'cycling',
  'mixed',
  'private-driver',
]);

const foodEnum = z.enum([
  'local',
  'international',
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'fine-dining',
  'street-food',
  'mixed',
]);

const preferencesSchema = z.object({
  interests: z.array(interestsEnum).min(1, 'Select at least one interest').max(10),
  accommodation: accommodationEnum,
  transportation: transportationEnum,
  food: foodEnum,
  additionalRequirements: z.string().max(1000).optional(),
});

export const createTripSchema = z.object({
  destination: destinationSchema,
  startingLocation: z.string().min(1, 'Starting location is required').trim(),
  dates: datesSchema,
  duration: z.number().int().min(1).max(365, 'Duration cannot exceed 365 days'),
  travellers: travellersSchema,
  budget: budgetSchema,
  preferences: preferencesSchema,
  status: z.enum(['draft', 'saved']).default('draft').optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
