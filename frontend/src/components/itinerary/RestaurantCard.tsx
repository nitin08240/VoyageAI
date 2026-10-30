import React from 'react';
import { Utensils, MapPin, DollarSign, ShieldCheck } from 'lucide-react';
import { IRestaurant } from '@/types/itinerary.types';

interface RestaurantCardProps {
  restaurant: IRestaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {restaurant.cuisine || 'Local Cuisine'}
          </span>
          <div className="flex items-center gap-1 font-bold text-sm text-emerald-400">
            <DollarSign className="w-4 h-4" />
            <span>{restaurant.costEstimate || '$$'}</span>
          </div>
        </div>

        <h4 className="text-lg font-serif font-bold text-white mb-1.5 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-accent-400 shrink-0" />
          <span>{restaurant.name}</span>
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{restaurant.location}</span>
        </div>

        {restaurant.mustTry && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed mb-4">
            <span className="text-amber-400 font-semibold">Must Try: </span>
            {restaurant.mustTry}
          </div>
        )}

        {/* Dietary suitability tags */}
        {restaurant.dietaryOptions && restaurant.dietaryOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {restaurant.dietaryOptions.map((opt, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-navy-900 border border-white/10 text-[10px] font-medium text-emerald-300"
              >
                {opt}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        {restaurant.verified ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Establishment
          </span>
        ) : (
          <span className="text-[10px] text-slate-500">AI Recommendation</span>
        )}

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.location)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-400 hover:underline font-semibold"
        >
          View on Map &rarr;
        </a>
      </div>
    </div>
  );
};

export default RestaurantCard;

