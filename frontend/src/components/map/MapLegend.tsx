import React from 'react';
import { BedDouble, Utensils, Compass, Sparkles, MapPin } from 'lucide-react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-navy-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200">
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold">
          <BedDouble className="w-2.5 h-2.5" />
        </span>
        <span>Hotels</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[9px] text-white font-bold">
          <Utensils className="w-2.5 h-2.5" />
        </span>
        <span>Dining</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold">
          <Sparkles className="w-2.5 h-2.5" />
        </span>
        <span>Attractions</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold">
          <Compass className="w-2.5 h-2.5" />
        </span>
        <span>Activities</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">
          <MapPin className="w-2.5 h-2.5" />
        </span>
        <span>Destination</span>
      </div>
    </div>
  );
};
