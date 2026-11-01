import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  CloudSun,
  Droplets,
  Wind,
  Check,
  Plus,
  Sparkles,
} from 'lucide-react';
import { chatService } from '@/services/chatService';

interface CardProps {
  data: any;
  onActionComplete?: () => void;
}

export const PlaceCard: React.FC<CardProps> = ({ data }) => {
  return (
    <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 hover:border-accent-500/40 transition-all text-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-100 text-sm leading-snug">{data.name}</h4>
          <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-accent-400 shrink-0" />
            <span>{data.hub || data.address || 'Regional Landmark'}</span>
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-500/15 text-accent-300 border border-accent-500/30 whitespace-nowrap">
          {data.category || 'Sightseeing'}
        </span>
      </div>

      {data.description && (
        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
          {data.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          {data.distanceKm !== undefined && (
            <span className="font-medium text-slate-300">{data.distanceKm} km away</span>
          )}
          {data.estimatedTravelMinutes && (
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              ~{data.estimatedTravelMinutes} mins
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const WeatherCard: React.FC<CardProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-navy-900 to-navy-950 border border-sky-500/25 rounded-xl p-3.5 text-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-100 text-sm">{data.locationName || 'Destination'}</h4>
            <p className="text-slate-400 text-[11px] capitalize">{data.description || data.condition || 'Clear'}</p>
          </div>
        </div>
        {data.temperature !== undefined && (
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-sky-300">{data.temperature}°</span>
            <span className="text-xs text-slate-400">C</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
        {data.humidity !== undefined && (
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400/80" />
            <span>Humidity: {data.humidity}%</span>
          </div>
        )}
        {data.windSpeed !== undefined && (
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-400/80" />
            <span>Wind: {data.windSpeed} km/h</span>
          </div>
        )}
      </div>

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-navy-950/60 p-2 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-400 shrink-0 mt-0.5" />
          <span>{data.recommendations[0]}</span>
        </div>
      )}
    </div>
  );
};

export const RouteCard: React.FC<CardProps> = ({ data }) => {
  return (
    <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
      <div className="flex items-center justify-between text-slate-400 text-[11px]">
        <span className="flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-accent-400" />
          Road Route & Travel Time
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 capitalize">
          {data.travelMode || 'Driving'}
        </span>
      </div>

      <div className="flex items-center justify-between py-1 border-y border-slate-800/80">
        <div className="font-medium text-slate-200 text-xs">{data.origin}</div>
        <div className="flex-1 mx-3 flex items-center justify-center relative">
          <div className="w-full border-t border-dashed border-slate-600" />
          <span className="absolute bg-navy-900 px-1 text-[10px] text-accent-400 font-mono">
            {data.distanceKm}
          </span>
        </div>
        <div className="font-medium text-slate-200 text-xs">{data.destination}</div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Estimated Duration:</span>
        <span className="font-semibold text-slate-200">{data.estimatedDuration}</span>
      </div>

      {data.routeDescription && (
        <p className="text-slate-400 text-[11px] italic bg-navy-950/40 p-1.5 rounded">
          {data.routeDescription}
        </p>
      )}
    </div>
  );
};

export const ItineraryActionCard: React.FC<CardProps> = ({ data, onActionComplete }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!data.tripId || !data.dayNumber || !data.slot || !data.newActivity) return;
    setIsApplying(true);
    try {
      await chatService.applyItinerarySuggestion({
        tripId: data.tripId,
        dayNumber: data.dayNumber,
        slot: data.slot,
        newActivity: data.newActivity,
      });
      setApplied(true);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Failed to apply itinerary suggestion:', err);
      alert('Could not update itinerary. Please ensure this trip is active.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-accent-500/10 border border-accent-500/30 rounded-xl p-3.5 text-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-accent-300 text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          Proposed Itinerary Update
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-500/20 text-accent-200 uppercase">
          Day {data.dayNumber} • {data.slot}
        </span>
      </div>

      <div className="bg-navy-950/70 p-2.5 rounded-lg border border-accent-500/20 space-y-1">
        <h5 className="font-medium text-white text-xs">{data.newActivity?.name}</h5>
        {data.newActivity?.description && (
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {data.newActivity.description}
          </p>
        )}
      </div>

      <button
        onClick={handleApply}
        disabled={isApplying || applied}
        className={`w-full py-1.5 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all ${
          applied
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
            : 'bg-accent-500 hover:bg-accent-600 text-white shadow-md shadow-accent-500/20 active:scale-[0.98]'
        }`}
      >
        {applied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Applied to Itinerary
          </>
        ) : isApplying ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            Apply This to My Itinerary
          </>
        )}
      </button>
    </div>
  );
};
