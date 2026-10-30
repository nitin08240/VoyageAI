import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value?: number; // 0-100
  progress?: number; // alias for value
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'accent' | 'success' | 'warning' | 'info';
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantStyles = {
  accent: 'from-accent-500 to-accent-600',
  success: 'from-emerald-500 to-emerald-600',
  warning: 'from-amber-500 to-amber-600',
  info: 'from-blue-500 to-blue-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'accent',
  animated = true,
  className,
}) => {
  const numericValue = value !== undefined ? value : progress !== undefined ? progress : 0;
  const percentage = Math.min(Math.max((numericValue / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-warm-200/70">{label}</span>}
          {showValue && (
            <span className="text-xs font-bold text-warm-200">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-white/5 overflow-hidden',
          sizeStyles[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            variantStyles[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.8 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// Step progress bar for wizard
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  stepNames,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    isCompleted && 'bg-accent-500 text-white',
                    isCurrent && 'bg-accent-500/20 border-2 border-accent-500 text-accent-400',
                    !isCompleted && !isCurrent && 'bg-white/5 border border-white/10 text-warm-200/30'
                  )}
                >
                  {isCompleted ? '✓' : step}
                </div>
                {stepNames?.[i] && (
                  <span
                    className={cn(
                      'text-xs hidden sm:block transition-colors',
                      isCurrent ? 'text-accent-400 font-medium' : 'text-warm-200/30'
                    )}
                  >
                    {stepNames[i]}
                  </span>
                )}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 rounded-full transition-all duration-300 mb-5',
                    isCompleted ? 'bg-accent-500' : 'bg-white/5'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
