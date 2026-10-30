import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import ItineraryTimeline from '@/components/itinerary/ItineraryTimeline';
import HotelCard from '@/components/itinerary/HotelCard';
import RestaurantCard from '@/components/itinerary/RestaurantCard';
import TravelMap from '@/components/map/TravelMap';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { itineraryService } from '@/services/itineraryService';
import type { IItinerary } from '@/types/itinerary.types';

export const SharedTrip: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [tripData, setTripData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);

    itineraryService
      .getSharedItinerary(token)
      .then((data: any) => {
        setItinerary(data.itinerary || data);
        setTripData(data.trip || data);
      })
      .catch((err) => {
        console.error('Failed to load shared itinerary:', err);
        setError('This shared trip link is invalid or has expired.');
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-96" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !itinerary) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Shared Trip Unavailable</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">{error || 'Unable to retrieve itinerary.'}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Explore VoyageAI
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const destination = tripData?.destination?.city || tripData?.destination?.name || 'Shared Destination';

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Banner for Shared Viewers */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-500/20 via-amber-500/20 to-blue-500/20 border border-accent-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent-400" />
            <span className="text-xs text-slate-200">
              You are viewing a shared itinerary curated with <strong className="text-white">VoyageAI</strong>.
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/trips/create')}
            className="text-xs font-semibold shrink-0"
          >
            Plan Your Own Trip <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Hero Header */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 shadow-2xl relative">
          <div className="flex items-center gap-1.5 text-xs text-accent-400 uppercase tracking-wider font-semibold mb-2">
            <MapPin className="w-4 h-4" />
            <span>{tripData?.destination?.country || 'Destination'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-white mb-4">
            {destination}
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            {typeof itinerary.overview === 'string'
              ? itinerary.overview
              : (itinerary.overview as any)?.destinationIntroduction || 'Curated day-by-day travel plan.'}
          </p>
        </div>

        {/* Day-by-Day Timeline */}
        {itinerary.days && itinerary.days.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Daily Schedule</h2>
            <ItineraryTimeline days={itinerary.days} />
          </div>
        )}

        {/* Hotels */}
        {itinerary.hotels && itinerary.hotels.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Curated Stays</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itinerary.hotels.map((hotel, i) => (
                <HotelCard key={i} hotel={hotel} />
              ))}
            </div>
          </div>
        )}

        {/* Restaurants */}
        {itinerary.restaurants && itinerary.restaurants.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-white mb-4">Dining Hotspots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itinerary.restaurants.map((rest, i) => (
                <RestaurantCard key={i} restaurant={rest} />
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Interactive Map</h2>
          <TravelMap
            destination={destination}
            hotels={itinerary.hotels || []}
            restaurants={itinerary.restaurants || []}
            activities={itinerary.days?.flatMap((d) => d.activities) || []}
          />
        </div>
      </div>
    </PageWrapper>
  );
};

export default SharedTrip;
