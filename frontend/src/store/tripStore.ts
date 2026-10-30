import { create } from 'zustand';
import type { ITrip, ICreateTripPayload } from '@/types/trip.types';
import type { IItinerary, IGenerationJob } from '@/types/itinerary.types';
import { tripService } from '@/services/tripService';
import { itineraryService } from '@/services/itineraryService';

interface TripStore {
  trips: ITrip[];
  currentTrip: ITrip | null;
  currentItinerary: IItinerary | null;
  generationJob: IGenerationJob | null;
  isLoading: boolean;
  error: string | null;

  // Trip actions
  setTrips: (trips: ITrip[]) => void;
  setCurrentTrip: (trip: ITrip | null) => void;
  fetchTrips: () => Promise<void>;
  fetchTripById: (id: string) => Promise<void>;
  createTrip: (payload: ICreateTripPayload) => Promise<ITrip>;
  updateTrip: (id: string, payload: Partial<ICreateTripPayload>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  // Itinerary actions
  setCurrentItinerary: (itinerary: IItinerary | null) => void;
  setGenerationJob: (job: IGenerationJob | null) => void;
  fetchItinerary: (tripId: string) => Promise<void>;
  startGeneration: (tripId: string) => Promise<string>;
  pollJobStatus: (jobId: string) => Promise<void>;

  clearError: () => void;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  currentTrip: null,
  currentItinerary: null,
  generationJob: null,
  isLoading: false,
  error: null,

  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
  setGenerationJob: (job) => set({ generationJob: job }),
  clearError: () => set({ error: null }),

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const trips = await tripService.getTrips();
      set({ trips, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch trips', isLoading: false });
      throw err;
    }
  },

  fetchTripById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await tripService.getTripById(id);
      set({ currentTrip: trip, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch trip', isLoading: false });
      throw err;
    }
  },

  createTrip: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await tripService.createTrip(payload);
      set(state => ({ trips: [trip, ...state.trips], currentTrip: trip, isLoading: false }));
      return trip;
    } catch (err) {
      set({ error: 'Failed to create trip', isLoading: false });
      throw err;
    }
  },

  updateTrip: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tripService.updateTrip(id, payload);
      set(state => ({
        trips: state.trips.map(t => t._id === id ? updated : t),
        currentTrip: state.currentTrip?._id === id ? updated : state.currentTrip,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Failed to update trip', isLoading: false });
      throw err;
    }
  },

  deleteTrip: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tripService.deleteTrip(id);
      set(state => ({
        trips: state.trips.filter(t => t._id !== id),
        currentTrip: state.currentTrip?._id === id ? null : state.currentTrip,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: 'Failed to delete trip', isLoading: false });
      throw err;
    }
  },

  fetchItinerary: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const itinerary = await itineraryService.getItinerary(tripId);
      set({ currentItinerary: itinerary, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch itinerary', isLoading: false });
      throw err;
    }
  },

  startGeneration: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const { jobId } = await itineraryService.generateItinerary(tripId);
      set({ generationJob: { jobId, status: 'pending' }, isLoading: false });
      return jobId;
    } catch (err) {
      set({ error: 'Failed to start generation', isLoading: false });
      throw err;
    }
  },

  pollJobStatus: async (jobId) => {
    try {
      const job = await itineraryService.getJobStatus(jobId);
      set({ generationJob: job });

      if (job.status === 'completed' && job.itineraryId) {
        const currentTrip = get().currentTrip;
        if (currentTrip) {
          await get().fetchItinerary(currentTrip._id);
        }
      }
    } catch (err) {
      set({ error: 'Failed to get job status' });
      throw err;
    }
  },
}));
