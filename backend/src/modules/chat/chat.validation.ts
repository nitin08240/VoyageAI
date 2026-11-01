import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().optional().nullable(),
  tripId: z.string().optional().nullable(),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message cannot exceed 4000 characters')
    .trim(),
});

export const applySuggestionSchema = z.object({
  tripId: z.string().min(1, 'tripId is required'),
  dayNumber: z.number().int().min(1).max(30),
  slot: z.enum(['morning', 'afternoon', 'evening']),
  newActivity: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    duration: z.string().optional(),
    cost: z.string().or(z.number()).optional(),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ApplySuggestionInput = z.infer<typeof applySuggestionSchema>;

