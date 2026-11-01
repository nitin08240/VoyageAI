import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Compass, Calendar, MapPin, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { useTripStore } from '@/store/tripStore';
import PageWrapper from '@/components/layout/PageWrapper';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { trips, fetchTrips, isLoading } = useTripStore();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const totalTrips = trips.length;
  const completedTrips = trips.filter((t) => t.status === 'completed').length;
  const totalDays = trips.reduce((acc, t) => acc + (t.dates?.duration || 1), 0);
  const totalBudgetManaged = trips.reduce((acc, t) => acc + (t.budget?.amount ?? t.budget?.total ?? 0), 0);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Top Welcome Banner */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Voyager Central
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Welcome, {user?.name || 'Explorer'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg">
              Manage your generated itineraries, inspect budget distributions, or orchestrate your next journey.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/trips/create')}
              className="w-full sm:w-auto text-xs font-semibold shadow-lg shadow-accent-500/25"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Plan New Trip
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <Compass className="w-4 h-4 mr-1.5" /> Explore
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-accent-400" /> Total Trips
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {totalTrips}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">{completedTrips} AI itineraries generated</div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-sky-400" /> Days Planned
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {totalDays}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Across all schedules</div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" /> Budget Managed
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              ${totalBudgetManaged.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Estimated travel capital</div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-accent-400" /> AI Engine
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Smart Planner
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live & Ready
            </div>
          </div>
        </div>

        {/* Recent Trips Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white">Your Recent Journeys</h2>
              <p className="text-slate-400 text-xs">Jump back into your custom itineraries.</p>
            </div>
            {trips.length > 0 && (
              <Link to="/trips" className="text-xs text-accent-400 hover:underline font-semibold flex items-center gap-1">
                View All Trips ({trips.length}) &rarr;
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trips.slice(0, 3).map((trip) => {
                const isReady = trip.status === 'completed';
                const depStr = trip.dates?.departureDate || (trip.dates?.start ? new Date(trip.dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming');
                const retStr = trip.dates?.returnDate || (trip.dates?.end ? new Date(trip.dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');
                const budgetVal = trip.budget?.amount ?? trip.budget?.total ?? 0;

                return (
                  <div
                    key={trip._id}
                    className="p-6 rounded-3xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-4">
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

                      <div className="text-xs text-slate-400 space-y-1 mb-4">
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
                        to={isReady ? `/trips/${trip._id}/itinerary` : `/trips/${trip._id}/generate`}
                        className="text-xs font-semibold text-accent-400 hover:text-accent-300 flex items-center gap-1"
                      >
                        {isReady ? 'View Full Itinerary' : 'Continue Generation'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 glass-card rounded-3xl border border-white/10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No trips created yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Start your first adventure! Configure destination, dates, budget, and let VoyageAI generate your custom plan.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/trips/create')}
                className="text-xs font-semibold shadow-lg shadow-accent-500/20"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Create First Trip
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
