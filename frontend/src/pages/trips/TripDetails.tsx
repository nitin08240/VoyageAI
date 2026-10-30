import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { tripService } from '@/services/tripService';
import type { ITrip } from '@/types/trip.types';

export const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<ITrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    tripService
      .getTripById(id)
      .then((data) => setTrip(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || !trip) return;
    setIsSaving(true);
    setMessage(null);

    try {
      await tripService.updateTrip(id, {
        destination: trip.destination,
        dates: trip.dates,
        budget: trip.budget,
        travellers: trip.travellers,
        preferences: trip.preferences,
      });
      setMessage('Trip parameters updated successfully.');
    } catch (err: any) {
      setMessage('Failed to update trip.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !trip) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="h-96 rounded-3xl glass-card animate-pulse" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/trips')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trips/${id}/itinerary`)}
              className="text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-accent-400" /> View Itinerary
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSave}
              className="text-xs font-semibold shadow-lg shadow-accent-500/20"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Notification message */}
        {message && (
          <div className="p-4 rounded-2xl bg-accent-500/15 border border-accent-500/30 text-accent-300 text-xs font-medium">
            {message}
          </div>
        )}

        {/* Main Details Card */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-400 block mb-1">
                Trip Specifications
              </span>
              <h1 className="text-3xl font-serif font-bold text-white">
                {trip.destination.city || (trip.destination as any).name}, {trip.destination.country}
              </h1>
            </div>
            <Badge variant={trip.status === 'completed' ? 'success' : 'warning'}>
              {trip.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                City / Region
              </label>
              <Input
                value={trip.destination.city || (trip.destination as any).name || ''}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    destination: { ...trip.destination, city: e.target.value },
                  })
                }
                className="bg-navy-900/60 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Country
              </label>
              <Input
                value={trip.destination.country || ''}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    destination: { ...trip.destination, country: e.target.value },
                  })
                }
                className="bg-navy-900/60 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Departure Date
              </label>
              <Input
                type="date"
                value={trip.dates.departureDate}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    dates: { ...trip.dates, departureDate: e.target.value },
                  })
                }
                className="bg-navy-900/60 border-white/10 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Return Date
              </label>
              <Input
                type="date"
                value={trip.dates.returnDate}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    dates: { ...trip.dates, returnDate: e.target.value },
                  })
                }
                className="bg-navy-900/60 border-white/10 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Total Budget ({trip.budget.currency})
              </label>
              <Input
                type="number"
                value={trip.budget.amount}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    budget: { ...trip.budget, amount: parseFloat(e.target.value) || 0 },
                  })
                }
                className="bg-navy-900/60 border-white/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Travelers (Adults)
              </label>
              <Input
                type="number"
                min="1"
                value={trip.travellers.adults}
                onChange={(e) =>
                  setTrip({
                    ...trip,
                    travellers: { ...trip.travellers, adults: parseInt(e.target.value, 10) || 1 },
                  })
                }
                className="bg-navy-900/60 border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TripDetails;
