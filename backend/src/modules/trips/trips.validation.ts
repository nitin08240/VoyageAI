import { z } from 'zod';

export const destinationSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  startingLocation: z.string().optional(),
  additionalDestinations: z.array(z.string()).optional(),
});

export const datesSchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  duration: z.number().optional(),
  isFlexible: z.boolean().optional(),
});

export const travellersSchema = z.object({
  type: z.string().optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
  infants: z.number().int().min(0).default(0),
});

export const budgetSchema = z.object({
  total: z.number().optional(),
  amount: z.number().optional(),
  currency: z.string().optional().default('USD'),
  perPerson: z.boolean().optional().default(false),
  isPerPerson: z.boolean().optional(),
  category: z.string().optional(),
});

export const preferencesSchema = z.object({
  interests: z.array(z.string()).default(['culture', 'food']),
  accommodation: z.string().default('mid-range-hotel'),
  transportation: z.string().optional(),
  transport: z.union([z.string(), z.array(z.string())]).optional(),
  food: z.union([z.string(), z.record(z.any())]).optional(),
  additionalRequirements: z.string().optional(),
  additional: z.record(z.any()).optional(),
});

export const createTripSchema = z.object({
  destination: destinationSchema,
  startingLocation: z.string().optional(),
  dates: datesSchema,
  duration: z.number().int().min(1).max(365).optional(),
  travellers: travellersSchema,
  budget: budgetSchema,
  preferences: preferencesSchema,
  status: z.enum(['draft', 'saved', 'generating', 'completed', 'failed']).default('draft').optional(),
});

export const updateTripSchema = createTripSchema.partial();

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
