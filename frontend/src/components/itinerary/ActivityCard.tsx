import React, { useState } from 'react';
import { Clock, MapPin, Navigation, DollarSign, CheckCircle2 } from 'lucide-react';
import { IActivity } from '@/types/itinerary.types';

interface ActivityCardProps {
  activity: IActivity;
  onToggleComplete?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onToggleComplete }) => {
  const [completed, setCompleted] = useState(activity.completed || false);

  const handleToggle = () => {
    setCompleted(!completed);
    onToggleComplete?.();
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        completed
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

      <p className="text-slate-300 text-xs leading-relaxed mb-4">
        {activity.description}
      </p>

      {/* Meta Bar: Cost, Transit, Map */}
      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-1 font-semibold text-emerald-400">
          <DollarSign className="w-3.5 h-3.5" />
          <span>
            {activity.cost === '0' || activity.cost === 0 || activity.estimatedCost === 0 ? 'Free' : `$${activity.cost || activity.estimatedCost || '15'}`}
          </span>
        </div>

        {(activity.transportation || activity.transportToNext) && (
          <div className="flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-accent-400" />
            <span>Transit: {activity.transportation || activity.transportToNext}</span>
          </div>
        )}

        {(activity.coordinates || activity.location) && (
          <a
            href={
              activity.coordinates
                ? `https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location || '')}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-accent-400 hover:underline ml-auto"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map Pin</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;

