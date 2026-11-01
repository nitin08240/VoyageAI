import { z } from 'zod';

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const activitySchema = z.object({
  time: z.string().max(100).optional(),
  name: z.string().min(1, 'Activity name is required').max(200),
  description: z.string().max(2000).optional(),
  duration: z.string().max(100).optional(),
  cost: z.string().max(100).optional(),
  travelTime: z.string().max(100).optional(),
  transportation: z.string().max(100).optional(),
  mapLink: z.string().max(1000).optional(),
  coordinates: coordinatesSchema.optional(),
  imageUrl: z.string().max(1000).optional(),
  thumbUrl: z.string().max(1000).optional(),
  imagePhotographer: z.string().max(200).optional(),
  imagePhotographerUrl: z.string().max(1000).optional(),
  photoId: z.string().max(100).optional(),
  placeId: z.string().max(200).optional(),
  distanceKm: z.number().min(0).max(20000).optional(),
});

export const dayWeatherSchema = z.object({
  forecastAvailable: z.boolean().optional(),
  date: z.string().max(50).optional(),
  temperature: z.number().optional(),
  minTemperature: z.number().optional(),
  maxTemperature: z.number().optional(),
  condition: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).max(500).optional(),
  rainProbability: z.number().min(0).max(100).optional(),
  recommendations: z.array(z.string().max(500)).max(20).optional(),
  message: z.string().max(500).optional(),
  lastUpdated: z.union([z.string(), z.date()]).optional(),
});

export const daySchema = z.object({
  dayNumber: z.number().int().min(1).max(60),
  date: z.string().min(1).max(50),
  title: z.string().min(1).max(300),
  morning: z.array(activitySchema).max(20).optional().default([]),
  afternoon: z.array(activitySchema).max(20).optional().default([]),
  evening: z.array(activitySchema).max(20).optional().default([]),
  practicalAdvice: z.string().max(3000).optional(),
  weather: dayWeatherSchema.optional(),
});

export const hotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required').max(200),
  location: z.string().min(1).max(300),
  category: z.string().max(100),
  priceRange: z.string().max(100),
  facilities: z.array(z.string().max(100)).max(50).optional().default([]),
  whyRecommended: z.string().max(2000),
  bookingLink: z.string().max(1000).optional(),
  verified: z.boolean().optional(),
  coordinates: coordinatesSchema.optional(),
  imageUrl: z.string().max(1000).optional(),
  thumbUrl: z.string().max(1000).optional(),
  imagePhotographer: z.string().max(200).optional(),
  imagePhotographerUrl: z.string().max(1000).optional(),
  photoId: z.string().max(100).optional(),
  placeId: z.string().max(200).optional(),
  distanceKm: z.number().min(0).max(20000).optional(),
});

export const restaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(200),
  cuisine: z.string().min(1).max(200),
  estimatedCost: z.string().max(100),
  dietarySuitability: z.array(z.string().max(100)).max(50).optional().default([]),
  location: z.string().min(1).max(300),
  verified: z.boolean().optional(),
  coordinates: coordinatesSchema.optional(),
  imageUrl: z.string().max(1000).optional(),
  thumbUrl: z.string().max(1000).optional(),
  imagePhotographer: z.string().max(200).optional(),
  imagePhotographerUrl: z.string().max(1000).optional(),
  photoId: z.string().max(100).optional(),
  placeId: z.string().max(200).optional(),
  distanceKm: z.number().min(0).max(20000).optional(),
});

export const packingItemSchema = z.object({
  category: z.string().min(1).max(100),
  items: z.array(z.string().max(200)).max(100),
});

export const updateItinerarySchema = z
  .object({
    days: z.array(daySchema).max(60).optional(),
    hotels: z.array(hotelSchema).max(100).optional(),
    restaurants: z.array(restaurantSchema).max(100).optional(),
    activities: z.array(activitySchema).max(200).optional(),
    safetyTips: z.array(z.string().max(1000)).max(50).optional(),
    packingChecklist: z.array(packingItemSchema).max(50).optional(),
    travelTips: z.array(z.string().max(1000)).max(50).optional(),
    thingsToAvoid: z.array(z.string().max(1000)).max(50).optional(),
  })
  .strict();

export type UpdateItineraryInput = z.infer<typeof updateItinerarySchema>;
