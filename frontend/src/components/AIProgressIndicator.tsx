import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Hotel, Utensils, Wallet, CheckCircle2 } from 'lucide-react';

interface AIProgressIndicatorProps {
  progress?: number;
  currentStep?: string;
  destination?: string;
}

const STEPS = [
  { id: 1, label: 'Synthesizing traveler preferences & constraints', icon: Compass },
  { id: 2, label: 'Curating optimal day-by-day sightseeing routes', icon: Sparkles },
  { id: 3, label: 'Vetting recommended boutique & luxury stays', icon: Hotel },
  { id: 4, label: 'Matching culinary hotspots to food profile', icon: Utensils },
  { id: 5, label: 'Validating mathematical budget allocations', icon: Wallet },
];

export const AIProgressIndicator: React.FC<AIProgressIndicatorProps> = ({
  progress = 45,
  currentStep = 'Synthesizing itinerary details...',
  destination = 'your dream destination',
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-8 rounded-3xl glass-card border border-white/15 shadow-2xl relative overflow-hidden text-center">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Central Pulsing Brain / Radar */}
      <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-accent-500/20 border border-accent-400/40"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-dashed border-accent-400/50"
        />
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-accent-500/40">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl font-serif font-bold text-white mb-2">
        Crafting Your Itinerary
      </h2>
      <p className="text-accent-400 font-semibold text-xs mb-2">
        {currentStep}
      </p>
      <p className="text-slate-400 text-xs mb-6">
        Gemini 2.0 Flash is analyzing thousands of travel data points for <span className="text-accent-400 font-semibold">{destination}</span>.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-navy-900/80 rounded-full h-3 border border-white/10 p-0.5 mb-8">
        <motion.div
          className="bg-gradient-to-r from-accent-500 to-amber-400 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step Checklist */}
      <div className="space-y-3 text-left">
        {STEPS.map((step, idx) => {
          const isDone = (progress / 100) * 5 > idx + 0.5;
          const isCurrent = !isDone && (progress / 100) * 5 >= idx;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : isCurrent
                  ? 'bg-accent-500/10 border-accent-500/30 text-accent-300'
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Icon className={`w-4 h-4 ${isCurrent ? 'animate-bounce text-accent-400' : ''}`} />
                )}
              </div>
              <span className="text-xs font-medium tracking-wide">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIProgressIndicator;
