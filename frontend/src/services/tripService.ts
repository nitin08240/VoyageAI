import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { ITrip, ICreateTripPayload } from '@/types/trip.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const tripService = {
  createTrip: async (payload: ICreateTripPayload | any): Promise<ITrip> => {
    // Normalize payload to ensure compatibility with backend schema
    const departure = payload.dates?.departureDate || payload.dates?.start || new Date().toISOString().split('T')[0];
    const returnDate = payload.dates?.returnDate || payload.dates?.end || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const duration = payload.dates?.duration || payload.duration || Math.max(1, Math.round((new Date(returnDate).getTime() - new Date(departure).getTime()) / (1000 * 60 * 60 * 24)));

    let transportStr = payload.preferences?.transportation || 'mixed';
    if (Array.isArray(payload.preferences?.transport)) {
      transportStr = payload.preferences.transport.join(', ');
    } else if (typeof payload.preferences?.transport === 'string') {
      transportStr = payload.preferences.transport;
    }

    let foodStr = 'local';
    if (typeof payload.preferences?.food === 'string') {
      foodStr = payload.preferences.food;
    } else if (payload.preferences?.food?.diet) {
      foodStr = `${payload.preferences.food.diet} ${payload.preferences.food.restrictions || ''}`.trim();
    }

    const normalized = {
      destination: {
        name: payload.destination?.city || payload.destination?.name || payload.destination?.country || 'Destination',
        country: payload.destination?.country || 'Worldwide',
        city: payload.destination?.city || payload.destination?.name || '',
      },
      startingLocation: payload.startingLocation || payload.destination?.startingLocation || 'Not specified',
      dates: {
        start: new Date(departure),
        end: new Date(returnDate),
      },
      duration,
      travellers: {
        adults: payload.travellers?.adults || 1,
        children: payload.travellers?.children || 0,
        infants: payload.travellers?.infants || 0,
      },
      budget: {
        total: payload.budget?.total ?? payload.budget?.amount ?? 2000,
        currency: payload.budget?.currency || 'USD',
        perPerson: payload.budget?.perPerson ?? payload.budget?.isPerPerson ?? false,
      },
      preferences: {
        interests: payload.preferences?.interests || ['culture'],
        accommodation: payload.preferences?.accommodation || 'mid-range-hotel',
        transportation: transportStr,
        food: foodStr,
        additionalRequirements: payload.preferences?.additionalRequirements || payload.preferences?.additional?.specialRequests || '',
      },
      status: 'draft',
    };

    const res = await apiPost<ApiResponse<ITrip>>('/trips', normalized);
    return res.data.data;
  },

  getTrips: async (): Promise<ITrip[]> => {
    const res = await apiGet<ApiResponse<ITrip[]>>('/trips');
    return res.data.data;
  },

  getTripById: async (id: string): Promise<ITrip> => {
    const res = await apiGet<ApiResponse<ITrip>>(`/trips/${id}`);
    return res.data.data;
  },

  updateTrip: async (id: string, payload: Partial<ICreateTripPayload>): Promise<ITrip> => {
    const res = await apiPatch<ApiResponse<ITrip>>(`/trips/${id}`, payload);
    return res.data.data;
  },

  deleteTrip: async (id: string): Promise<void> => {
    await apiDelete(`/trips/${id}`);
  },

  duplicateTrip: async (id: string): Promise<ITrip> => {
    const res = await apiPost<ApiResponse<ITrip>>(`/trips/${id}/duplicate`);
    return res.data.data;
  },

  shareTrip: async (id: string): Promise<{ shareToken: string }> => {
    const res = await apiPost<ApiResponse<{ shareToken: string }>>(`/trips/${id}/share`);
    return res.data.data;
  },

  unshareTrip: async (id: string): Promise<void> => {
    await apiDelete(`/trips/${id}/share`);
  },

  getSharedTrip: async (token: string): Promise<ITrip> => {
    const res = await apiGet<ApiResponse<ITrip>>(`/shared/${token}`);
    return res.data.data;
  },
};
