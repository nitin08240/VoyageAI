import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, onRightIconClick, className, id, name, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || name || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : generatedId);
    const inputName = name || inputId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-warm-200/80 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-200/40 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={inputName}
            aria-label={!label ? (props['aria-label'] || props.placeholder || inputName) : undefined}
            className={cn(
              'w-full h-11 rounded-xl text-sm font-medium transition-all duration-200',
              'input-glass',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              !leftIcon && 'pl-4',
              !rightIcon && 'pr-4',
              error &&
                'border-red-500/60 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className={cn(
                'absolute right-3.5 top-1/2 -translate-y-1/2 text-warm-200/40',
                onRightIconClick && 'hover:text-warm-200 transition-colors cursor-pointer'
              )}
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-warm-200/50">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
