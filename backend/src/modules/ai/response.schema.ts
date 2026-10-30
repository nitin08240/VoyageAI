import { z } from 'zod';

export const activitySchema = z.object({
  time: z.string().default('Morning'),
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().default('2 hours'),
  cost: z.number().nonnegative().default(0),
  travelTime: z.string().default('15 mins'),
  transportation: z.string().default('Walk'),
  mapLink: z.string().optional(),
});

export const daySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string(),
  title: z.string().min(1),
  morning: z.array(activitySchema).min(1),
  afternoon: z.array(activitySchema).min(1),
  evening: z.array(activitySchema).min(1),
  practicalAdvice: z.string().optional().default('Stay hydrated and keep copies of your ID.'),
});

export const hotelSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  category: z.string().default('Standard'),
  priceRange: z.string().default('$100 - $150 / night'),
  facilities: z.array(z.string()).default([]),
  whyRecommended: z.string().min(1),
  bookingLink: z.string().optional(),
  verified: z.boolean().default(false),
});

export const restaurantSchema = z.object({
  name: z.string().min(1),
  cuisine: z.string().min(1),
  estimatedCost: z.number().nonnegative().default(20),
  dietarySuitability: z.array(z.string()).default([]),
  location: z.string().min(1),
  verified: z.boolean().default(false),
});

export const budgetBreakdownSchema = z.object({
  accommodation: z.number().nonnegative().default(0),
  food: z.number().nonnegative().default(0),
  transportation: z.number().nonnegative().default(0),
  activities: z.number().nonnegative().default(0),
  shopping: z.number().nonnegative().default(0),
  miscellaneous: z.number().nonnegative().default(0),
  emergencyReserve: z.number().nonnegative().default(0),
  total: z.number().nonnegative().default(0),
});

export const packingChecklistSchema = z.object({
  clothing: z.array(z.string()).default([]),
  documents: z.array(z.string()).default([]),
  electronics: z.array(z.string()).default([]),
  personalEssentials: z.array(z.string()).default([]),
  destinationSpecific: z.array(z.string()).default([]),
});

export const geminiItineraryResponseSchema = z.object({
  overview: z.object({
    destination: z.string(),
    duration: z.string(),
    travelDates: z.string(),
    travelStyle: z.string(),
    destinationIntroduction: z.string(),
    recommendedTravelSeason: z.string(),
    estimatedTotalBudget: z.number(),
  }),
  days: z.array(daySchema).min(1),
  hotels: z.array(hotelSchema).min(1),
  restaurants: z.array(restaurantSchema).min(1),
  activities: z.array(z.string()).default([]),
  budgetBreakdown: budgetBreakdownSchema,
  safetyTips: z.array(z.string()).default([]),
  thingsToAvoid: z.array(z.string()).default([]),
  packingChecklist: packingChecklistSchema,
  travelTips: z.array(z.string()).default([]),
});

export type GeminiItineraryResponse = z.infer<typeof geminiItineraryResponseSchema>;
