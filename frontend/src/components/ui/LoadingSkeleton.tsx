import React from 'react';
import { cn } from '@/lib/utils';

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'full-page' | 'custom';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  lines?: number; // for text variant
}

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'shimmer rounded-lg bg-white/5',
      className
    )}
  />
);

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'custom',
  className,
  lines = 3,
}) => {
  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBlock
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <SkeletonBlock className={cn('w-10 h-10 rounded-full', className)} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('glass-card rounded-2xl p-6 space-y-4', className)}>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
        </div>
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-5/6" />
        <SkeletonBlock className="h-3 w-4/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonBlock className="h-8 w-24 rounded-xl" />
          <SkeletonBlock className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === 'full-page') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-accent-500/30 border-t-accent-500 animate-spin" />
          <p className="text-warm-200/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <SkeletonBlock className={className} />;
};

// Trip card grid skeleton
export const TripCardsSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <LoadingSkeleton key={i} variant="card" />
    ))}
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
        <SkeletonBlock className="h-8 w-8 rounded-lg" />
        <SkeletonBlock className="h-7 w-20" />
        <SkeletonBlock className="h-3 w-full" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
