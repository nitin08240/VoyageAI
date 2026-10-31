import React from 'react';
import { ExternalLink, Clock, DollarSign, Calendar, MapPin, CheckCircle, Sparkles } from 'lucide-react';
import { MapLocation } from '@/types/map.types';

interface MarkerPopupProps {
  location: MapLocation;
}

export const MarkerPopup: React.FC<MarkerPopupProps> = ({ location }) => {
  const { name, category, description, address, dayNumber, timeSlot, estimatedDuration, estimatedCost, coordinates, verificationStatus } = location;

  // External OSM link with real coordinates or query
  const osmUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=16/${coordinates.lat}/${coordinates.lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent(name)}`;

  const getCategoryColor = () => {
    switch (category) {
      case 'hotel':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'restaurant':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'attraction':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'activity':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    }
  };

  return (
    <div className="p-1 min-w-[220px] max-w-[280px] text-slate-100 font-sans">
      {/* Category & Day Badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor()}`}>
          {category}
        </span>
        {dayNumber && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
            <Calendar className="w-3 h-3 text-accent-400" /> Day {dayNumber}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-white leading-snug mb-1">{name}</h4>

      {/* Description */}
      {description && (
        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
          {description}
        </p>
      )}

      {/* Details Row */}
      <div className="space-y-1 text-[11px] text-slate-300 border-t border-white/10 pt-2 mb-3">
        {timeSlot && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3 h-3 text-accent-400" />
            <span className="capitalize">{timeSlot}</span>
            {estimatedDuration && <span>• {estimatedDuration}</span>}
          </div>
        )}

        {estimatedCost !== undefined && estimatedCost !== null && (
          <div className="flex items-center gap-1.5 text-slate-400">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span>Cost: {typeof estimatedCost === 'number' ? `$${estimatedCost}` : estimatedCost}</span>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-1.5 text-slate-400">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>

      {/* Verification Status & External Link */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2 text-[10px]">
        <div className="flex items-center gap-1 text-slate-400">
          {verificationStatus === 'verified' ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" /> OSM Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-accent-400">
              <Sparkles className="w-3 h-3" /> AI Curated
            </span>
          )}
        </div>

        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-semibold text-accent-400 hover:text-accent-300 transition-colors"
        >
          <span>Open in OSM</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
