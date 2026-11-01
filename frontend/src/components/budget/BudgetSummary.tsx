import React from 'react';
import { Wallet, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { IBudgetBreakdown } from '@/types/itinerary.types';
import { formatCurrency } from '@/lib/currency';
import BudgetChart from './BudgetChart';

interface BudgetSummaryProps {
  budget: IBudgetBreakdown;
  targetBudget?: number;
  travelerCount?: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  budget,
  targetBudget = budget.total,
  travelerCount = 1,
}) => {
  const isOverBudget = budget.total > targetBudget;
  const variance = Math.abs(targetBudget - budget.total);
  const perPerson = Math.round(budget.total / Math.max(1, travelerCount));

  const currency = (budget as any).currency || 'USD';
  const transportAmt = (budget as any).transportation ?? budget.transport ?? 0;
  const misc = (budget as any).emergencyReserve ?? (budget as any).shopping ?? budget.miscellaneous ?? 0;

  const categories = [
    { label: 'Accommodation', amount: budget.accommodation || 0, color: 'bg-orange-500' },
    { label: 'Food & Dining', amount: budget.food || 0, color: 'bg-sky-400' },
    { label: 'Transportation', amount: transportAmt, color: 'bg-emerald-400' },
    { label: 'Activities & Attractions', amount: budget.activities || 0, color: 'bg-purple-400' },
    { label: 'Miscellaneous & Contingency', amount: misc, color: 'bg-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Warning banner if budget exceeded */}
      {isOverBudget ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-300">Target Budget Exceeded</div>
            <div className="text-xs text-amber-200/80 mt-0.5">
              The estimated total exceeds your target by {formatCurrency(variance, currency)}. Consider adjusting stay tier or activities.
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-emerald-300">Within Planned Budget</div>
            <div className="text-xs text-emerald-200/80 mt-0.5">
              Estimated expenses fit your budget with {formatCurrency(variance, currency)} buffer remaining.
            </div>
          </div>
        </div>
      )}

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-950/60 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
            <Wallet className="w-4 h-4 text-accent-400" /> Target Budget
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {formatCurrency(targetBudget, currency)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950/60 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Estimated Spend
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {formatCurrency(budget.total, currency)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950/60 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4 text-sky-400" /> Per Person
          </div>
          <div className="text-2xl font-serif font-bold text-white">
            {formatCurrency(perPerson, currency)}
          </div>
        </div>
      </div>

      {/* Chart + Breakdown Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl glass-card border border-white/10 items-center">
        <div>
          <h4 className="text-base font-serif font-bold text-white mb-1">Cost Distribution</h4>
          <p className="text-xs text-slate-400 mb-4">Calculated based on real destination estimates.</p>
          <BudgetChart budget={budget} />
        </div>

        {/* Category progress bars */}
        <div className="space-y-4">
          {categories.map((cat, i) => {
            const pct = budget.total > 0 ? Math.round((cat.amount / budget.total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">{cat.label}</span>
                  <span className="font-bold text-white">
                    {formatCurrency(cat.amount, budget.currency)}{' '}
                    <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-navy-900 border border-white/5 overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;

