import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTripStore } from '@/store/tripStore';
import { tripService } from '@/services/tripService';
import type { ICreateTripPayload } from '@/types/trip.types';

export function useTrip() {
  const {
    trips,
    currentTrip,
    currentItinerary,
    isLoading,
    error,
    fetchTrips,
    fetchTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    clearError,
  } = useTripStore();

  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateTrip = useCallback(
    async (payload: ICreateTripPayload) => {
      setActionLoading(true);
      try {
        const trip = await createTrip(payload);
        toast.success('Trip created successfully!');
        return trip;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create trip';
        toast.error(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [createTrip]
  );

  const handleUpdateTrip = useCallback(
    async (id: string, payload: Partial<ICreateTripPayload>) => {
      setActionLoading(true);
      try {
        await updateTrip(id, payload);
        toast.success('Trip updated successfully!');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update trip';
        toast.error(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [updateTrip]
  );

  const handleDeleteTrip = useCallback(
    async (id: string) => {
      setActionLoading(true);
      try {
        await deleteTrip(id);
        toast.success('Trip deleted successfully!');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete trip';
        toast.error(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [deleteTrip]
  );

  const handleDuplicateTrip = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      const trip = await tripService.duplicateTrip(id);
      toast.success('Trip duplicated!');
      await fetchTrips();
      return trip;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate trip';
      toast.error(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [fetchTrips]);

  const handleShareTrip = useCallback(async (id: string) => {
    setActionLoading(true);
    try {
      const { shareToken } = await tripService.shareTrip(id);
      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      return shareToken;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to share trip';
      toast.error(message);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    trips,
    currentTrip,
    currentItinerary,
    isLoading,
    actionLoading,
    error,
    clearError,
    fetchTrips,
    fetchTripById,
    createTrip: handleCreateTrip,
    updateTrip: handleUpdateTrip,
    deleteTrip: handleDeleteTrip,
    duplicateTrip: handleDuplicateTrip,
    shareTrip: handleShareTrip,
  };
}
