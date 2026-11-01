import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IBudgetBreakdown } from '@/types/itinerary.types';
import { formatCurrency } from '@/lib/currency';

interface BudgetChartProps {
  budget: IBudgetBreakdown;
}

const COLORS = [
  '#f97316', // Orange / Accent (Accommodation)
  '#38bdf8', // Sky Blue (Food)
  '#34d399', // Emerald (Transport)
  '#a855f7', // Purple (Activities)
  '#fbbf24', // Amber (Shopping)
  '#f43f5e', // Rose (Miscellaneous)
];

export const BudgetChart: React.FC<BudgetChartProps> = ({ budget }) => {
  const chartData = [
    { name: 'Accommodation', value: budget.accommodation || 0 },
    { name: 'Food & Dining', value: budget.food || 0 },
    { name: 'Transportation', value: (budget as any).transportation ?? budget.transport ?? 0 },
    { name: 'Activities & Tours', value: budget.activities || 0 },
    { name: 'Miscellaneous', value: (budget as any).emergencyReserve ?? (budget as any).shopping ?? budget.miscellaneous ?? 0 },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-navy-950/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="text-xs text-slate-400 font-medium">{data.name}</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {formatCurrency(data.value, budget.currency)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Central Total Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Est.</span>
        <span className="text-xl font-bold font-serif text-white">
          {formatCurrency(budget.total, budget.currency)}
        </span>
      </div>
    </div>
  );
};

export default BudgetChart;

