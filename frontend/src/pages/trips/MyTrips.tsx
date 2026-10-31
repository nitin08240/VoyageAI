import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  Calendar,
  MapPin,
  Trash2,
  Copy,
  ExternalLink,
  Filter,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { tripService } from '@/services/tripService';
import type { ITrip } from '@/types/trip.types';

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const data = await tripService.getTrips();
      setTrips(data || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async () => {
    if (!tripToDelete) return;
    try {
      await tripService.deleteTrip(tripToDelete);
      setTrips(trips.filter((t) => t._id !== tripToDelete && (t as any).id !== tripToDelete));
      setTripToDelete(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await tripService.duplicateTrip(id);
      setTrips([dup, ...trips]);
    } catch (err) {
      console.error('Failed to duplicate trip:', err);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const dest = `${t.destination.city || ''} ${t.destination.country || ''}`.toLowerCase();
    const matchesSearch = dest.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">My Trips</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              All your customized travel plans in one centralized itinerary hub.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/trips/create')}
            className="text-xs font-semibold shadow-lg shadow-accent-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Plan New Trip
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="trips-search"
              name="search"
              aria-label="Search destination"
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-accent-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 mr-1" />
            {['all', 'completed', 'generating', 'draft'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl glass-card animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const tripId = trip._id || (trip as any).id;
              const isReady = trip.status === 'completed';
              const depStr = trip.dates?.departureDate || (trip.dates?.start ? new Date(trip.dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming');
              const retStr = trip.dates?.returnDate || (trip.dates?.end ? new Date(trip.dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');
              const budgetVal = trip.budget?.amount ?? trip.budget?.total ?? 0;

              return (
                <div
                  key={tripId}
                  className="p-6 rounded-3xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge
                        variant={isReady ? 'success' : trip.status === 'generating' ? 'warning' : 'neutral'}
                      >
                        {trip.status}
                      </Badge>
                      <span className="text-xs font-bold text-accent-400">
                        {trip.budget?.currency || 'USD'} {budgetVal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-accent-400" />
                      <span>{trip.destination?.country || 'Worldwide'}</span>
                    </div>

                    <h3 className="text-xl font-serif font-bold text-white mb-2">
                      {trip.destination?.city || trip.destination?.name || 'Custom Trip'}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-400 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {depStr} {retStr ? `→ ${retStr}` : ''} ({trip.dates?.duration || 1}d)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      to={isReady ? `/trips/${tripId}/itinerary` : `/trips/${tripId}/generate`}
                      className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1"
                    >
                      {isReady ? 'View Itinerary' : 'Generate'} <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tripId)}
                        title="Duplicate Trip"
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripToDelete(tripId)}
                        title="Delete Trip"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl border border-white/10 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Trips Found</h3>
            <p className="text-xs text-slate-400">
              No matching itineraries found. Plan your first getaway today.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/trips/create')}
              className="text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Trip
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!tripToDelete}
          onClose={() => setTripToDelete(null)}
          title="Delete Trip Itinerary"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this trip and its generated itineraries? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTripToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default MyTrips;

