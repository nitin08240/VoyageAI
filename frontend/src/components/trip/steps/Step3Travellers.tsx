import React from 'react';
import { User, Users, Heart, Baby, Briefcase } from 'lucide-react';
import { ITravellers } from '@/types/trip.types';

interface Step3TravellersProps {
  data: ITravellers;
  onChange: (data: Partial<ITravellers>) => void;
}

const PARTY_TYPES = [
  { id: 'solo', label: 'Solo Explorer', desc: 'Indie exploration & freedom', icon: User },
  { id: 'couple', label: 'Couple / Romance', desc: 'Intimate escapes & dining', icon: Heart },
  { id: 'friends', label: 'Friend Group', desc: 'Nightlife, adventure & thrills', icon: Users },
  { id: 'family', label: 'Family Trip', desc: 'Kid-friendly, safe & relaxed', icon: Baby },
  { id: 'business', label: 'Business & Bleisure', desc: 'Productive with leisure add-ons', icon: Briefcase },
] as const;

export const Step3Travellers: React.FC<Step3TravellersProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Who is joining this journey?</h3>
        <p className="text-slate-400 text-sm mt-1">We optimize pacing, activities, and room setups to your group.</p>
      </div>

      {/* Party Type Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PARTY_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.type === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange({ type: type.id })}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-accent-500/15 border-accent-400 shadow-lg shadow-accent-500/10'
                  : 'bg-navy-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-accent-500 text-white' : 'bg-white/5 text-slate-300'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-sm text-white">{type.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{type.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Numeric Counts */}
      <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Adults</div>
            <div className="text-xs text-slate-400">Age 13+</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={data.adults <= 1}
              onClick={() => onChange({ adults: Math.max(1, data.adults - 1) })}
              className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-6 text-center font-bold text-white text-base">{data.adults}</span>
            <button
              type="button"
              onClick={() => onChange({ adults: data.adults + 1 })}
              className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Children</div>
            <div className="text-xs text-slate-400">Ages 0 - 12</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={data.children <= 0}
              onClick={() => onChange({ children: Math.max(0, data.children - 1) })}
              className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-6 text-center font-bold text-white text-base">{data.children}</span>
            <button
              type="button"
              onClick={() => onChange({ children: data.children + 1 })}
              className="w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Travellers;

