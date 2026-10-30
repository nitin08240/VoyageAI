import React from 'react';
import { MapPin, Calendar, Users, Wallet, Sparkles, BedDouble, Utensils } from 'lucide-react';
import { Button } from '../ui/Button';
import { ICreateTripPayload } from '@/types/trip.types';

interface TripSummaryProps {
  data: ICreateTripPayload;
  onGenerate: () => void;
  isLoading: boolean;
}

export const TripSummary: React.FC<TripSummaryProps> = ({ data, onGenerate, isLoading }) => {
  const { destination, dates, travellers, budget, preferences } = data;

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Review Your Grand Blueprint</h3>
        <p className="text-slate-400 text-sm mt-1">
          Everything is set. Ready to orchestrate your personalized itinerary?
        </p>
      </div>

      {/* Grid of specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Destination */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Destination</div>
            <div className="text-base font-bold text-white">{destination.city}, {destination.country}</div>
            <div className="text-xs text-slate-400 mt-0.5">Departing from: {destination.startingLocation || 'Not specified'}</div>
          </div>
        </div>

        {/* Dates & Duration */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Dates & Duration</div>
            <div className="text-base font-bold text-white">{dates.duration || 1} Days Planned</div>
            <div className="text-xs text-slate-400 mt-0.5">{dates.departureDate} &rarr; {dates.returnDate}</div>
          </div>
        </div>

        {/* Travelers */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <Users className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Travel Party</div>
            <div className="text-base font-bold text-white capitalize">{travellers.type} Group</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {travellers.adults} Adult(s) {travellers.children > 0 ? `, ${travellers.children} Child(ren)` : ''}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <Wallet className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Budget Limit</div>
            <div className="text-base font-bold text-white">
              {budget.currency} {budget.amount.toLocaleString()} {budget.isPerPerson ? '/ person' : 'total'}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 capitalize">{budget.category} Category</div>
          </div>
        </div>

        {/* Stay & Transit */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <BedDouble className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Stay & Transit</div>
            <div className="text-sm font-semibold text-white capitalize">{preferences.accommodation.replace('_', ' ')}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {(preferences.transport || []).join(', ') || 'Mixed transit'}
            </div>
          </div>
        </div>

        {/* Dining & Interests */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/10 flex items-start gap-3">
          <Utensils className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Dining & Pacing</div>
            <div className="text-sm font-semibold text-white capitalize">{preferences.food.diet.replace('_', ' ')}</div>
            <div className="text-xs text-slate-400 mt-0.5 capitalize">{preferences.additional.sightseeingPace} sightseeing pace</div>
          </div>
        </div>
      </div>

      {/* Selected Interest Badges */}
      {preferences.interests.length > 0 && (
        <div className="p-4 rounded-2xl bg-navy-900/40 border border-white/10">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Selected Interests</div>
          <div className="flex flex-wrap gap-2">
            {preferences.interests.map((i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-accent-500/15 border border-accent-400/30 text-accent-300 text-xs font-medium capitalize">
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Button */}
      <div className="pt-4">
        <Button
          onClick={onGenerate}
          isLoading={isLoading}
          variant="primary"
          size="lg"
          className="w-full text-base py-4 shadow-xl shadow-accent-500/25"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Personalized AI Itinerary
        </Button>
      </div>
    </div>
  );
};

export default TripSummary;
