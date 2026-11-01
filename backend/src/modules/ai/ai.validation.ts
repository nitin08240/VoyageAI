import { z } from 'zod';

export const generateItinerarySchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
});

export const regenerateItinerarySchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
});

export type GenerateItineraryInput = z.infer<typeof generateItinerarySchema>;
export type RegenerateItineraryInput = z.infer<typeof regenerateItinerarySchema>;
