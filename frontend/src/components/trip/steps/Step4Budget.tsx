import React from 'react';
import { Wallet, DollarSign, Gem, ShieldCheck } from 'lucide-react';
import { Input } from '../../ui/Input';
import { IBudget } from '@/types/trip.types';

interface Step4BudgetProps {
  data: IBudget;
  onChange: (data: Partial<IBudget>) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'CHF'];

const TIERS = [
  { id: 'budget', label: 'Backpacker / Economy', desc: 'Hostels, public transit, street food gems', icon: DollarSign },
  { id: 'comfort', label: 'Balanced / Comfort', desc: 'Boutique 3-4★ hotels, mixed dining, private transfers', icon: ShieldCheck },
  { id: 'luxury', label: 'High-End / Luxury', desc: '5★ resorts, Michelin/fine dining, VIP experiences', icon: Gem },
] as const;

export const Step4Budget: React.FC<Step4BudgetProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
          <Wallet className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white">What is your financial boundary?</h3>
        <p className="text-slate-400 text-sm mt-1">VoyageAI calculates costs strictly to prevent overshooting.</p>
      </div>

      {/* Budget Amount + Currency Input */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Target Budget Amount *
          </label>
          <Input
            type="number"
            min="100"
            step="50"
            placeholder="e.g. 3500"
            value={data.amount || ''}
            onChange={(e) => onChange({ amount: parseFloat(e.target.value) || 0 })}
            className="bg-navy-900/60 border-white/10 text-lg font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Currency
          </label>
          <select
            value={data.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-white/10 text-white font-medium focus:border-accent-400 focus:outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-navy-950 text-white">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Per Person / Total Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-navy-900/40 border border-white/10">
        <div>
          <div className="text-sm font-semibold text-white">Per Person Calculation</div>
          <div className="text-xs text-slate-400">Interpret entered amount as individual budget</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={data.isPerPerson}
            onChange={(e) => onChange({ isPerPerson: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-navy-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
        </label>
      </div>

      {/* Tier Category Cards */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
          Travel Spending Tier
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isSelected = data.category === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onChange({ category: tier.id })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-accent-500/15 border-accent-400 shadow-lg shadow-accent-500/10'
                    : 'bg-navy-900/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-accent-500 text-white' : 'bg-white/5 text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-sm text-white">{tier.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tier.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step4Budget;

