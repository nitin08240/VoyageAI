import React from 'react';
import { BedDouble, MapPin, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { IHotel } from '@/types/itinerary.types';

interface HotelCardProps {
  hotel: IHotel;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const bookingUrl =
    hotel.bookingUrl ||
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + (hotel.city || hotel.location))}`;

  return (
    <div className="rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between h-full overflow-hidden">
      {/* Hotel Photo if available */}
      {(hotel.imageUrl || hotel.thumbUrl) && (
        <div className="h-40 w-full relative overflow-hidden bg-navy-950/60">
          <img
            src={hotel.imageUrl || hotel.thumbUrl}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {hotel.imagePhotographer && (
            <div className="absolute bottom-1 right-2 text-[9px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
              Photo by {hotel.imagePhotographer}
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/20">
              {hotel.category || 'Hotel'}
            </span>
            {hotel.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="text-sm font-bold text-accent-400">
            {hotel.priceRange || '$150 - $220 / night'}
          </div>
        </div>

        <h4 className="text-lg font-serif font-bold text-white mb-1.5 flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-accent-400 shrink-0" />
          <span>{hotel.name}</span>
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{hotel.location}</span>
        </div>

        {/* Why recommended */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
          <div className="flex items-center gap-1 text-accent-400 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Why Recommended:
          </div>
          {hotel.whyRecommended}
        </div>

        {/* Facilities tags */}
        {hotel.facilities && hotel.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.facilities.map((fac, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-navy-900 border border-white/10 text-[10px] font-medium text-slate-300"
              >
                {fac}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA: Live booking link */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
          AI Suggested Stay
        </span>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-400 hover:text-accent-300 font-semibold flex items-center gap-1 group"
        >
          Check Availability <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default HotelCard;

