import { z } from 'zod';

export const updateItinerarySchema = z.object({
  days: z.array(z.any()).optional(),
  hotels: z.array(z.any()).optional(),
  restaurants: z.array(z.any()).optional(),
  activities: z.array(z.any()).optional(),
  safetyTips: z.array(z.string()).optional(),
  packingChecklist: z.array(z.any()).optional(),
  travelTips: z.array(z.string()).optional(),
  thingsToAvoid: z.array(z.string()).optional(),
}).strict();

export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;
