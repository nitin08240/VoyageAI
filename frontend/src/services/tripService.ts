import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { ITrip, ICreateTripPayload } from '@/types/trip.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

export const tripService = {
  createTrip: async (payload: ICreateTripPayload): Promise<ITrip> => {
    const res = await apiPost<ApiResponse<ITrip>>('/trips', payload);
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
