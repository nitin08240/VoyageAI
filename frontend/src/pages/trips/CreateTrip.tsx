import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import TripWizard from '@/components/trip/TripWizard';
import { tripService } from '@/services/tripService';
import { ICreateTripPayload } from '@/types/trip.types';

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDest = searchParams.get('destination') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload: ICreateTripPayload) => {
    setIsSubmitting(true);
    try {
      // Create trip document in backend
      const newTrip = await tripService.createTrip(payload);
      const tripId = newTrip._id || (newTrip as any).id;

      // Navigate to AI generation progress view
      navigate(`/trips/${tripId}/generate`);
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <TripWizard
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          initialData={
            preselectedDest
              ? {
                  destination: {
                    country: '',
                    city: preselectedDest,
                    startingLocation: '',
                    additionalDestinations: [],
                  },
                }
              : undefined
          }
        />
      </div>
    </PageWrapper>
  );
};

export default CreateTrip;

