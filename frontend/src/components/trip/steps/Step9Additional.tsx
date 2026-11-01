import React from 'react';
import { Sliders, Accessibility, Users, Gauge, MessageSquare } from 'lucide-react';
import { IPreferences } from '@/types/trip.types';

interface Step9AdditionalProps {
  data: IPreferences;
  onChange: (data: Partial<IPreferences>) => void;
}

export const Step9Additional: React.FC<Step9AdditionalProps> = ({ data, onChange }) => {
  const add = data.additional;

  const updateAdd = (updates: Partial<typeof add>) => {
    onChange({ additional: { ...add, ...updates } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Sliders className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">Fine-Tune Pacing & Needs</h3>
        <p className="text-slate-400 text-sm mt-1">Specify pace, physical intensity, and accessibility needs.</p>
      </div>

      {/* Sightseeing Pace */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <Gauge className="w-4 h-4 text-accent-400" /> Sightseeing Pace
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['slow', 'medium', 'fast'] as const).map((p) => {
            const isSelected = add.sightseeingPace === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => updateAdd({ sightseeingPace: p })}
                className={`py-3 px-4 rounded-xl border text-center font-medium capitalize text-xs transition-all ${isSelected
                  ? 'bg-accent-500 text-white border-accent-400 shadow-md shadow-accent-500/20'
                  : 'bg-navy-900/40 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
              >
                {p === 'slow' ? 'Relaxed & Unhurried' : p === 'medium' ? 'Balanced Highlights' : 'Action-Packed Blitz'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Intensity */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          Daily Physical Intensity
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['relaxed', 'moderate', 'intensive'] as const).map((lvl) => {
            const isSelected = add.activityIntensity === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => updateAdd({ activityIntensity: lvl })}
                className={`py-3 px-4 rounded-xl border text-center font-medium capitalize text-xs transition-all ${isSelected
                  ? 'bg-accent-500 text-white border-accent-400 shadow-md shadow-accent-500/20'
                  : 'bg-navy-900/40 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <label htmlFor="toggle-accessibility" className="flex items-center justify-between p-4 rounded-xl bg-navy-900/40 border border-white/10 cursor-pointer">
          <div className="flex items-center gap-3">
            <Accessibility className="w-5 h-5 text-accent-400" />
            <div>
              <div className="text-sm font-semibold text-white">Wheelchair / Step-Free Accessible</div>
              <div className="text-xs text-slate-400">Exclude attractions without elevator or ramp access</div>
            </div>
          </div>
          <input
            id="toggle-accessibility"
            name="accessibilityRequired"
            type="checkbox"
            checked={add.accessibilityRequired}
            onChange={(e) => updateAdd({ accessibilityRequired: e.target.checked })}
            className="w-4 h-4 rounded text-accent-500 focus:ring-accent-500 bg-navy-950 border-white/20"
          />
        </label>

        <label htmlFor="toggle-elderly" className="flex items-center justify-between p-4 rounded-xl bg-navy-900/40 border border-white/10 cursor-pointer">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-accent-400" />
            <div>
              <div className="text-sm font-semibold text-white">Accommodate Children or Elderly</div>
              <div className="text-xs text-slate-400">Factor in frequent rest breaks, stairs avoidance, kid safety</div>
            </div>
          </div>
          <input
            id="toggle-elderly"
            name="childrenOrElderly"
            type="checkbox"
            checked={add.childrenOrElderly}
            onChange={(e) => updateAdd({ childrenOrElderly: e.target.checked })}
            className="w-4 h-4 rounded text-accent-500 focus:ring-accent-500 bg-navy-950 border-white/20"
          />
        </label>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-accent-400" /> Special Requests & Notes for VoyageAI
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Celebrating a 5th wedding anniversary on Day 3, prefer sunset views from viewpoints, interested in tea ceremonies..."
          value={add.specialRequests || ''}
          onChange={(e) => updateAdd({ specialRequests: e.target.value })}
          className="w-full px-4 py-3 rounded-xl bg-navy-900/60 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-accent-400 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
};

export default Step9Additional;

