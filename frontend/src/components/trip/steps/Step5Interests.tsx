import React from 'react';
import { Sparkles } from 'lucide-react';
import { IPreferences } from '@/types/trip.types';

interface Step5InterestsProps {
  data: IPreferences;
  onChange: (data: Partial<IPreferences>) => void;
}

const INTERESTS = [
  { id: 'adventure', label: 'Adventure & Thrills', icon: '🧗', desc: 'Hiking, skydiving, rafting' },
  { id: 'nature', label: 'Nature & Wildlife', icon: '🌿', desc: 'National parks, safaris, flora' },
  { id: 'mountains', label: 'Alpine & Peaks', icon: '🏔️', desc: 'Views, trekking, altitude' },
  { id: 'beaches', label: 'Beaches & Ocean', icon: '🏖️', desc: 'Coastal leisure, surfing, diving' },
  { id: 'historical', label: 'Historic Monuments', icon: '🏛️', desc: 'Castles, ruins, UNESCO sites' },
  { id: 'cultural', label: 'Local Culture', icon: '🎭', desc: 'Museums, festivals, folklore' },
  { id: 'food', label: 'Culinary & Tasting', icon: '🍜', desc: 'Street food, wineries, dining' },
  { id: 'shopping', label: 'Boutiques & Markets', icon: '🛍️', desc: 'Artisans, luxury, souvenirs' },
  { id: 'nightlife', label: 'Nightlife & Bars', icon: '🍸', desc: 'Rooftops, clubs, live music' },
  { id: 'photography', label: 'Scenic Photography', icon: '📸', desc: 'Iconic vantage spots, sunrise' },
  { id: 'relaxation', label: 'Wellness & Spa', icon: '🧘', desc: 'Hot springs, meditation, quiet' },
  { id: 'spiritual', label: 'Spiritual Sacred', icon: '⛩️', desc: 'Temples, shrines, cathedrals' },
];

export const Step5Interests: React.FC<Step5InterestsProps> = ({ data, onChange }) => {
  const toggleInterest = (id: string) => {
    const list = data.interests || [];
    if (list.includes(id)) {
      onChange({ interests: list.filter((i) => i !== id) });
    } else {
      onChange({ interests: [...list, id] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">What ignites your curiosity?</h3>
        <p className="text-slate-400 text-sm mt-1">Select all the themes you would love to experience.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {INTERESTS.map((item) => {
          const isSelected = data.interests?.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleInterest(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-28 ${
                isSelected
                  ? 'bg-accent-500/15 border-accent-400 shadow-md shadow-accent-500/10'
                  : 'bg-navy-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div>
                <div className="font-semibold text-xs text-white leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step5Interests;

