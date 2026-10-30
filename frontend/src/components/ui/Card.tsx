import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type CardVariant = 'glass' | 'solid' | 'bordered';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  glass: 'glass-card',
  solid: 'bg-navy-700 border border-white/5',
  bordered: 'bg-transparent border border-white/10',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  hover = false,
  padding = 'md',
  animate = false,
  className,
  children,
  ...props
}) => {
  const baseClass = cn(
    'rounded-2xl overflow-hidden',
    variantStyles[variant],
    paddingStyles[padding],
    hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-lg cursor-pointer',
    className
  );

  if (animate) {
    const { onDrag, onDragStart, onDragEnd, ...restProps } = props as any;
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={baseClass}
        {...restProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClass} {...props}>
      {children}
    </div>
  );
};

// Card sub-components
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-lg font-bold text-warm-200', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-white/5', className)} {...props}>
    {children}
  </div>
);
