import React from 'react';
import { Plane, Train, Bus, Car, Bike, Navigation } from 'lucide-react';
import { IPreferences } from '@/types/trip.types';

interface Step7TransportProps {
  data: IPreferences;
  onChange: (data: Partial<IPreferences>) => void;
}

const MODES = [
  { id: 'flight', label: 'Commercial Flight', icon: Plane, desc: 'Long distances & international legs' },
  { id: 'train', label: 'High-Speed / Scenic Train', icon: Train, desc: 'Bullet trains, regional rail, metro' },
  { id: 'public_transit', label: 'Local Public Transit', icon: Navigation, desc: 'Subway, trams, local buses' },
  { id: 'car_rental', label: 'Rental Car / Road Trip', icon: Car, desc: 'Freedom to explore off-the-beaten-path' },
  { id: 'bus', label: 'Intercity Bus / Coach', icon: Bus, desc: 'Budget-friendly regional transit' },
  { id: 'bike', label: 'Bicycle / Walking', icon: Bike, desc: 'Slow, pedestrian-friendly city wandering' },
];

export const Step7Transport: React.FC<Step7TransportProps> = ({ data, onChange }) => {
  const toggleTransport = (id: string) => {
    const list = data.transport || [];
    if (list.includes(id)) {
      onChange({ transport: list.filter((t) => t !== id) });
    } else {
      onChange({ transport: [...list, id] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Plane className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">How do you prefer to get around?</h3>
        <p className="text-slate-400 text-sm mt-1">Select all transit modes you're comfortable with.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = data.transport?.includes(mode.id);
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => toggleTransport(mode.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 ${
                isSelected
                  ? 'bg-accent-500/15 border-accent-400 shadow-md shadow-accent-500/10'
                  : 'bg-navy-900/40 border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-accent-500 text-white' : 'bg-white/5 text-slate-300'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">{mode.label}</div>
                <div className="text-xs text-slate-400">{mode.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step7Transport;

