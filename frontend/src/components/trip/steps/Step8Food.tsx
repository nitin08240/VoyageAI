import React from 'react';
import { UtensilsCrossed, AlertCircle } from 'lucide-react';
import { Input } from '../../ui/Input';
import { IPreferences } from '@/types/trip.types';

interface Step8FoodProps {
  data: IPreferences;
  onChange: (data: Partial<IPreferences>) => void;
}

const DIETS = [
  { id: 'no_preference', label: 'All Inclusive / Adventurous', desc: 'No restrictions, eager to try local specialties' },
  { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant-based with dairy and eggs permitted' },
  { id: 'non_vegetarian', label: 'Omnivore / Meat & Seafood', desc: 'Enjoys meats, poultry, and local catches' },
  { id: 'vegan', label: 'Strict Vegan', desc: '100% plant-based, zero animal byproducts' },
  { id: 'jain', label: 'Jain Friendly', desc: 'No root vegetables, purely lacto-vegetarian' },
] as const;

export const Step8Food: React.FC<Step8FoodProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Culinary Preferences & Diets</h3>
        <p className="text-slate-400 text-sm mt-1">We tailor daily lunch and dinner suggestions accordingly.</p>
      </div>

      <div className="space-y-2.5">
        {DIETS.map((diet) => {
          const isSelected = data.food.diet === diet.id;
          return (
            <button
              key={diet.id}
              type="button"
              onClick={() => onChange({ food: { ...data.food, diet: diet.id } })}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-accent-500/15 border-accent-400 shadow-md shadow-accent-500/10'
                  : 'bg-navy-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-semibold text-sm text-white">{diet.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{diet.desc}</div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-white/10">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-accent-400" /> Allergies or Food Restrictions
        </label>
        <Input
          placeholder="e.g. Gluten-free, peanut allergy, Halal, Kosher, no shell fish"
          value={data.food.restrictions || ''}
          onChange={(e) => onChange({ food: { ...data.food, restrictions: e.target.value } })}
          className="bg-navy-900/60 border-white/10"
        />
      </div>
    </div>
  );
};

export default Step8Food;

