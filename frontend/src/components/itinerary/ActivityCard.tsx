import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Coins, CheckCircle2, Compass } from 'lucide-react';
import { IActivity } from '@/types/itinerary.types';
import { formatCurrency } from '@/lib/currency';

interface ActivityCardProps {
  activity: IActivity;
  isSelected?: boolean;
  onSelect?: () => void;
  onViewOnMap?: () => void;
  onToggleComplete?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isSelected = false,
  onSelect,
  onViewOnMap,
  onToggleComplete,
}) => {
  const [completed, setCompleted] = useState(activity.completed || false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(!completed);
    onToggleComplete?.();
  };

  const osmUrl = activity.coordinates
    ? `https://www.openstreetmap.org/?mlat=${activity.coordinates.lat}&mlon=${activity.coordinates.lng}#map=16/${activity.coordinates.lat}/${activity.coordinates.lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(activity.name || activity.location || '')}`;

  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-accent-500/10 border-accent-400 ring-2 ring-accent-400/50 shadow-lg shadow-accent-500/10'
          : completed
          ? 'bg-navy-950/40 border-white/5 opacity-60'
          : 'glass-card border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-accent-500/10 text-accent-400 border border-accent-500/20">
            {activity.time || activity.timeOfDay || 'Scheduled'}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {activity.duration || '2 hours'}
          </span>
        </div>

        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleToggle}
          className="text-slate-400 hover:text-emerald-400 transition-colors"
          title={completed ? 'Mark incomplete' : 'Mark completed'}
        >
          <CheckCircle2
            className={`w-5 h-5 ${completed ? 'text-emerald-400 fill-emerald-400/20' : ''}`}
          />
        </button>
      </div>

      <h4 className={`text-base font-bold text-white mb-1.5 ${completed ? 'line-through text-slate-400' : ''}`}>
        {activity.name}
      </h4>

      {/* Attraction Photo if available */}
      {(activity.imageUrl || activity.thumbUrl) && (
        <div className="mb-3 w-full h-36 rounded-xl overflow-hidden relative bg-navy-950/60 border border-white/5 group">
          <img
            src={activity.imageUrl || activity.thumbUrl}
            alt={activity.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {activity.imagePhotographer && (
            <div className="absolute bottom-1 right-2 text-[9px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
              Photo by{' '}
              <a
                href={activity.imagePhotographerUrl || 'https://unsplash.com?utm_source=voyageai&utm_medium=referral'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline hover:text-white"
              >
                {activity.imagePhotographer}
              </a>{' '}
              on Unsplash
            </div>
          )}
        </div>
      )}

      <p className="text-slate-300 text-xs leading-relaxed mb-4">
        {activity.description}
      </p>

      {/* Meta Bar: Cost, Transit, Map actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-semibold text-emerald-400">
            <Coins className="w-3.5 h-3.5" />
            <span>
              {formatCurrency(activity.cost ?? activity.estimatedCost, activity.currency || 'INR')}
            </span>
          </div>

          {(activity.transportation || activity.transportToNext) && (
            <div className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-accent-400" />
              <span>Transit: {activity.transportation || activity.transportToNext}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Interactive Map Focus Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewOnMap) {
                onViewOnMap();
              } else {
                onSelect?.();
              }
            }}
            className="flex items-center gap-1 text-accent-400 hover:text-accent-300 font-semibold transition-colors px-2.5 py-1 rounded-lg bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/20"
            title="Focus venue on Interactive Map"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>View on Map</span>
          </button>

          {(activity.coordinates || activity.location) && (
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
              title="Open raw OpenStreetMap in new tab"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>OSM</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;

