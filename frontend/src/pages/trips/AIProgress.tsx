import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PageWrapper from '@/components/layout/PageWrapper';
import AIProgressIndicator from '@/components/AIProgressIndicator';
import { itineraryService } from '@/services/itineraryService';
import { tripService } from '@/services/tripService';

export const AIProgress: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(15);
  const [statusMessage, setStatusMessage] = useState<string>('Connecting to VoyageAI Engine...');
  const [destinationName, setDestinationName] = useState<string>('your destination');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);

  const pollIntervalRef = useRef<any>(null);

  // 1. Fetch trip details to display destination name
  useEffect(() => {
    if (!tripId) return;
    tripService
      .getTripById(tripId)
      .then((trip) => {
        const dest = trip.destination?.city || (trip.destination as any)?.name || 'your destination';
        setDestinationName(dest);
      })
      .catch((err) => console.error('Failed to load trip destination:', err));
  }, [tripId]);

  // 2. Start generation job
  const startJob = async () => {
    if (!tripId) return;
    setIsFailed(false);
    setErrorMessage(null);
    setProgress(15);
    setStatusMessage('Synthesizing your trip profile and constraints...');

    try {
      const res = await itineraryService.generateItinerary(tripId);
      setJobId(res.jobId);
    } catch (err: any) {
      console.error('Error starting generation:', err);
      setIsFailed(true);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Unable to connect to Gemini AI. Please retry.'
      );
    }
  };

  useEffect(() => {
    startJob();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [tripId]);

  // 3. Poll job status when jobId exists
  useEffect(() => {
    if (!jobId) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await itineraryService.getJobStatus(jobId);

        if (job.status === 'processing') {
          setProgress((prev) => Math.min(92, prev + 12));
          setStatusMessage('Crafting day-by-day itineraries and verifying budget...');
        } else if (job.status === 'completed') {
          setProgress(100);
          setStatusMessage('Itinerary finalized! Redirecting...');
          clearInterval(pollIntervalRef.current);
          setTimeout(() => {
            navigate(`/trips/${tripId}/itinerary`);
          }, 1200);
        } else if (job.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setIsFailed(true);
          setErrorMessage(
            job.error || 'The AI service encountered an error while validating the itinerary. Please try again.'
          );
        }
      } catch (err: any) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [jobId, tripId, navigate]);

  return (
    <PageWrapper>
      <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
        {isFailed ? (
          <div className="w-full max-w-lg p-8 rounded-3xl glass-card border border-red-500/20 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Generation Interrupted</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={startJob}
                className="w-full sm:w-auto text-xs font-semibold shadow-lg shadow-accent-500/20"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" /> Retry Generation
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <AIProgressIndicator
            progress={progress}
            currentStep={statusMessage}
            destination={destinationName}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default AIProgress;

