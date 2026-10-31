import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Lightbulb, Sun, Sunset, Moon } from 'lucide-react';
import { IItineraryDay } from '@/types/itinerary.types';
import ActivityCard from './ActivityCard';

interface ItineraryTimelineProps {
  days: IItineraryDay[];
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ days }) => {
  const [expandedDay, setExpandedDay] = useState<number>(1);

  const toggleDay = (dayNum: number) => {
    setExpandedDay(expandedDay === dayNum ? 0 : dayNum);
  };

  return (
    <div className="space-y-6">
      {days.map((day: any, idx: number) => {
        const dayNum = day.dayNumber ?? day.day ?? (idx + 1);
        const isOpen = expandedDay === dayNum;

        // Extract activities from day.morning/afternoon/evening OR day.activities
        const morningActs = day.morning?.length
          ? day.morning
          : (day.activities || []).filter((a: any) => a.timeOfDay === 'morning' || a.time?.toLowerCase().includes('am') || a.time?.toLowerCase().includes('morning'));

        const afternoonActs = day.afternoon?.length
          ? day.afternoon
          : (day.activities || []).filter((a: any) => a.timeOfDay === 'afternoon' || a.time?.toLowerCase().includes('afternoon'));

        const eveningActs = day.evening?.length
          ? day.evening
          : (day.activities || []).filter((a: any) => a.timeOfDay === 'evening' || a.timeOfDay === 'night' || a.time?.toLowerCase().includes('pm') || a.time?.toLowerCase().includes('evening'));

        const totalActs = (morningActs.length + afternoonActs.length + eveningActs.length) || (day.activities?.length || 0);

        return (
          <div
            key={dayNum}
            className="rounded-3xl glass-card border border-white/10 overflow-hidden shadow-xl transition-all"
          >
            {/* Day Header Accordion Trigger */}
            <button
              type="button"
              onClick={() => toggleDay(dayNum)}
              className="w-full p-6 text-left flex items-center justify-between gap-4 bg-navy-950/60 hover:bg-navy-900/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-500 to-amber-400 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-accent-500/20 shrink-0">
                  <span className="text-[10px] uppercase tracking-wider leading-none">Day</span>
                  <span className="text-lg leading-tight">{dayNum}</span>
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    {day.title || day.theme || `Day ${dayNum} Exploration`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-accent-400" />
                    <span>{day.date}</span>
                    <span>&bull;</span>
                    <span>{totalActs} Activities Planned</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-accent-500/20 border-accent-400/40' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border-t border-white/10 space-y-6"
                >
                  {/* Practical Advice Banner */}
                  {(day.practicalAdvice || day.notes) && (
                    <div className="p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-accent-400">Day Advice: </span>
                        {day.practicalAdvice || day.notes}
                      </div>
                    </div>
                  )}

                  {/* Morning Section */}
                  {morningActs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                        <Sun className="w-4 h-4" /> Morning Schedule
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {morningActs.map((act: any, i: number) => (
                          <ActivityCard key={i} activity={act} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Section */}
                  {afternoonActs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400 mb-3">
                        <Sunset className="w-4 h-4" /> Afternoon Schedule
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {afternoonActs.map((act: any, i: number) => (
                          <ActivityCard key={i} activity={act} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Section */}
                  {eveningActs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
                        <Moon className="w-4 h-4" /> Evening & Dining
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eveningActs.map((act: any, i: number) => (
                          <ActivityCard key={i} activity={act} />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default ItineraryTimeline;

