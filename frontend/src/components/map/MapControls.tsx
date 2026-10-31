import React from 'react';
import { MapCategoryFilter } from '@/types/map.types';
import { Filter, Calendar, Route, Maximize2 } from 'lucide-react';

interface MapControlsProps {
  totalDays: number;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
  selectedCategory: MapCategoryFilter;
  onSelectCategory: (category: MapCategoryFilter) => void;
  showRoutes: boolean;
  onToggleRoutes: () => void;
  onFitBounds: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  totalDays,
  selectedDay,
  onSelectDay,
  selectedCategory,
  onSelectCategory,
  showRoutes,
  onToggleRoutes,
  onFitBounds,
}) => {
  const categories: { id: MapCategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Places' },
    { id: 'attraction', label: 'Attractions' },
    { id: 'hotel', label: 'Hotels' },
    { id: 'restaurant', label: 'Dining' },
    { id: 'activity', label: 'Activities' },
  ];

  return (
    <div className="flex flex-col gap-3 w-full bg-navy-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-xl">
      {/* Top Row: Category Filter + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-accent-400" /> Filter:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Route */}
          <button
            type="button"
            onClick={onToggleRoutes}
            className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              showRoutes
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
            }`}
            title="Toggle OSRM Driving Route"
          >
            <Route className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Routes</span>
          </button>

          {/* Fit Bounds */}
          <button
            type="button"
            onClick={onFitBounds}
            className="px-3 py-1 rounded-xl text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white flex items-center gap-1.5 transition-all"
            title="Fit Map to Visible Locations"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Day Selector */}
      {totalDays > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/10 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-accent-400" /> Day:
          </span>

          <button
            type="button"
            onClick={() => onSelectDay(null)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              selectedDay === null
                ? 'bg-white/20 text-white font-bold border border-white/20'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            All Days
          </button>

          {Array.from({ length: totalDays }, (_, idx) => idx + 1).map((dayNum) => {
            const isDayActive = selectedDay === dayNum;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => onSelectDay(dayNum)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isDayActive
                    ? 'bg-accent-500 text-white font-bold shadow-md shadow-accent-500/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                Day {dayNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
