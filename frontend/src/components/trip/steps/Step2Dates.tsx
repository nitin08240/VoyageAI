import React from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { Input } from '../../ui/Input';
import { ITravelDates } from '@/types/trip.types';

interface Step2DatesProps {
  data: ITravelDates;
  onChange: (data: Partial<ITravelDates>) => void;
}

export const Step2Dates: React.FC<Step2DatesProps> = ({ data, onChange }) => {
  const calculateDuration = (dep: string, ret: string): number => {
    if (!dep || !ret) return 1;
    const d1 = new Date(dep);
    const d2 = new Date(ret);
    const diffTime = d2.getTime() - d1.getTime();
    if (diffTime < 0) return 1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDepChange = (val: string) => {
    const dur = calculateDuration(val, data.returnDate);
    onChange({ departureDate: val, duration: dur });
  };

  const handleRetChange = (val: string) => {
    const dur = calculateDuration(data.departureDate, val);
    onChange({ returnDate: val, duration: dur });
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">When are you traveling?</h3>
        <p className="text-slate-400 text-sm mt-1">Select your dates to build day-wise schedules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent-400" /> Departure Date *
          </label>
          <Input
            type="date"
            value={data.departureDate}
            onChange={(e) => handleDepChange(e.target.value)}
            className="bg-navy-900/60 border-white/10 [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent-400" /> Return Date *
          </label>
          <Input
            type="date"
            value={data.returnDate}
            min={data.departureDate}
            onChange={(e) => handleRetChange(e.target.value)}
            className="bg-navy-900/60 border-white/10 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Calculated Duration Banner */}
      <div className="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Duration</div>
            <div className="text-lg font-bold text-white">
              {data.duration || 1} {data.duration === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Flexible Dates Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={!!data.isFlexible}
            onChange={(e) => onChange({ isFlexible: e.target.checked })}
            className="rounded border-white/20 text-accent-500 focus:ring-accent-500 bg-navy-900 w-4 h-4"
          />
          <span className="text-xs text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-400" /> Flexible dates (+/- 3 days)
          </span>
        </label>
      </div>
    </div>
  );
};

export default Step2Dates;

