import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl px-3 py-2 text-sm',
          'bg-white text-slate-900 border border-slate-300',
          'placeholder:text-slate-400',
          'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          'transition-colors duration-150',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
