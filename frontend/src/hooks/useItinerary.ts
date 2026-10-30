import { useState, useEffect, useCallback, useRef } from 'react';
import { useTripStore } from '@/store/tripStore';
import { itineraryService } from '@/services/itineraryService';
import type { IGenerationJob } from '@/types/itinerary.types';

const POLL_INTERVAL = 2000; // 2 seconds

export function useItinerary(tripId?: string) {
  const {
    currentItinerary,
    generationJob,
    setGenerationJob,
    fetchItinerary,
    startGeneration,
  } = useTripStore();

  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(
    (jobId: string) => {
      setIsPolling(true);

      const poll = async () => {
        try {
          const job: IGenerationJob = await itineraryService.getJobStatus(jobId);
          setGenerationJob(job);

          if (job.status === 'completed') {
            stopPolling();
            if (tripId) {
              await fetchItinerary(tripId);
            }
          } else if (job.status === 'failed') {
            stopPolling();
            setError(job.error || 'Generation failed');
          }
        } catch {
          stopPolling();
          setError('Failed to get generation status');
        }
      };

      // Poll immediately then at interval
      poll();
      pollingRef.current = setInterval(poll, POLL_INTERVAL);
    },
    [tripId, setGenerationJob, fetchItinerary, stopPolling]
  );

  const generate = useCallback(
    async (tId?: string) => {
      const targetId = tId || tripId;
      if (!targetId) return;

      setError(null);
      try {
        const jobId = await startGeneration(targetId);
        startPolling(jobId);
        return jobId;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to start generation';
        setError(message);
        throw err;
      }
    },
    [tripId, startGeneration, startPolling]
  );

  const resumePolling = useCallback(
    (jobId: string) => {
      const job = generationJob;
      if (job && (job.status === 'pending' || job.status === 'processing')) {
        startPolling(jobId);
      }
    },
    [generationJob, startPolling]
  );

  // Auto-fetch itinerary if tripId available and completed
  useEffect(() => {
    if (tripId && !currentItinerary) {
      fetchItinerary(tripId).catch(() => {
        // Itinerary may not exist yet
      });
    }
  }, [tripId, currentItinerary, fetchItinerary]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    itinerary: currentItinerary,
    generationJob,
    isPolling,
    error,
    generate,
    resumePolling,
    stopPolling,
    fetchItinerary,
  };
}
