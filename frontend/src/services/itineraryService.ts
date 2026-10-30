import { apiGet, apiPost, apiPatch } from './api';
import type { IItinerary, IGenerationJob } from '@/types/itinerary.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const itineraryService = {
  generateItinerary: async (tripId: string): Promise<{ jobId: string }> => {
    const res = await apiPost<ApiResponse<{ jobId: string }>>('/ai/generate', { tripId });
    return res.data.data;
  },

  getJobStatus: async (jobId: string): Promise<IGenerationJob> => {
    const res = await apiGet<ApiResponse<IGenerationJob>>(`/ai/jobs/${jobId}`);
    return res.data.data;
  },

  getItinerary: async (tripId: string): Promise<IItinerary> => {
    const res = await apiGet<ApiResponse<{ itinerary: IItinerary }>>(`/itineraries/${tripId}`);
    return res.data.data.itinerary || (res.data.data as unknown as IItinerary);
  },

  updateItinerary: async (itineraryId: string, data: Partial<IItinerary>): Promise<IItinerary> => {
    const res = await apiPatch<ApiResponse<IItinerary>>(`/itineraries/${itineraryId}`, data);
    return res.data.data;
  },

  exportItinerary: async (itineraryId: string): Promise<any> => {
    const res = await apiPost<ApiResponse<any>>(`/itineraries/${itineraryId}/export`);
    return res.data.data;
  },

  regenerateItinerary: async (tripId: string): Promise<{ jobId: string }> => {
    const res = await apiPost<ApiResponse<{ jobId: string }>>('/ai/regenerate', { tripId });
    return res.data.data;
  },

  getSharedItinerary: async (token: string): Promise<IItinerary> => {
    const res = await apiGet<ApiResponse<any>>(`/shared/${token}`);
    return res.data.data?.itinerary || res.data.data;
  },
};
