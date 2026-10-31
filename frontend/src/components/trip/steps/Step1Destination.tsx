import React from 'react';
import { Globe2, MapPin, Building2, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../ui/Input';
import { IDestination } from '@/types/trip.types';

interface Step1DestinationProps {
  data: IDestination;
  onChange: (data: Partial<IDestination>) => void;
}

export const Step1Destination: React.FC<Step1DestinationProps> = ({ data, onChange }) => {
  const addAlternative = () => {
    const list = data.additionalDestinations || [];
    onChange({ additionalDestinations: [...list, ''] });
  };

  const removeAlternative = (index: number) => {
    const list = [...(data.additionalDestinations || [])];
    list.splice(index, 1);
    onChange({ additionalDestinations: list });
  };

  const updateAlternative = (index: number, val: string) => {
    const list = [...(data.additionalDestinations || [])];
    list[index] = val;
    onChange({ additionalDestinations: list });
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Globe2 className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Where is your next escape?</h3>
        <p className="text-slate-400 text-sm mt-1">Specify your primary destination and departure hub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dest-country" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-accent-400" /> Country *
          </label>
          <Input
            id="dest-country"
            name="country"
            placeholder="e.g. Japan, Italy, Switzerland"
            value={data.country}
            onChange={(e) => onChange({ country: e.target.value })}
            className="bg-navy-900/60 border-white/10"
          />
        </div>

        <div>
          <label htmlFor="dest-city" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-accent-400" /> City / Region *
          </label>
          <Input
            id="dest-city"
            name="city"
            placeholder="e.g. Kyoto, Amalfi Coast, Zurich"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="bg-navy-900/60 border-white/10"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dest-startingLocation" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-accent-400" /> Starting Location / Airport *
        </label>
        <Input
          id="dest-startingLocation"
          name="startingLocation"
          placeholder="e.g. New York (JFK), London (LHR), Mumbai (BOM)"
          value={data.startingLocation || ''}
          onChange={(e) => onChange({ startingLocation: e.target.value })}
          className="bg-navy-900/60 border-white/10"
        />
      </div>

      {/* Optional additional stops */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Multi-City or Day Trip Stops (Optional)
          </span>
          <button
            type="button"
            onClick={addAlternative}
            className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stop
          </button>
        </div>

        {data.additionalDestinations?.map((dest, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              placeholder={`Additional destination #${idx + 1}`}
              value={dest}
              onChange={(e) => updateAlternative(idx, e.target.value)}
              className="bg-navy-900/40 border-white/10"
            />
            <button
              type="button"
              onClick={() => removeAlternative(idx)}
              className="p-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step1Destination;

