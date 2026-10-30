import React from 'react';
import { BedDouble, Sparkles, Building, Castle, Home } from 'lucide-react';
import { IPreferences } from '@/types/trip.types';

interface Step6AccommodationProps {
  data: IPreferences;
  onChange: (data: Partial<IPreferences>) => void;
}

const ACCOMMODATIONS = [
  { id: 'hostel', label: 'Hostel / Social Dorm', desc: 'Social vibe, communal kitchens, ultra budget', price: '$', icon: Home },
  { id: 'budget_hotel', label: 'Budget Hotel / Inn', desc: 'Clean private room, basic amenities, great transit', price: '$$', icon: Building },
  { id: 'standard_hotel', label: 'Standard 3-Star Hotel', desc: 'Comfortable, private en-suite, central location', price: '$$$', icon: BedDouble },
  { id: 'premium_hotel', label: 'Premium 4-Star Boutique', desc: 'Character, designer aesthetics, great breakfast', price: '$$$$', icon: Sparkles },
  { id: 'luxury_resort', label: '5-Star Luxury Resort', desc: 'Spa, concierge service, prime views, fine dining', price: '$$$$$', icon: Castle },
] as const;

export const Step6Accommodation: React.FC<Step6AccommodationProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <BedDouble className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Where do you want to rest?</h3>
        <p className="text-slate-400 text-sm mt-1">Select your preferred hospitality category.</p>
      </div>

      <div className="space-y-3">
        {ACCOMMODATIONS.map((acc) => {
          const Icon = acc.icon;
          const isSelected = data.accommodation === acc.id;
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => onChange({ accommodation: acc.id })}
              className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-accent-500/15 border-accent-400 shadow-md shadow-accent-500/10'
                  : 'bg-navy-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-accent-500 text-white' : 'bg-white/5 text-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{acc.label}</div>
                  <div className="text-xs text-slate-400">{acc.desc}</div>
                </div>
              </div>

              <div className="text-xs font-bold text-accent-400 tracking-widest px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20">
                {acc.price}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step6Accommodation;

