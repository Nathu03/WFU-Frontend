import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-indigo-600 text-white',
        secondary:
          'border-slate-200 bg-slate-100 text-slate-700',
        outline:
          'border-slate-300 bg-transparent text-slate-700',
        destructive:
          'border-transparent bg-red-100 text-red-700 border-red-200',
        success:
          'border-transparent bg-emerald-100 text-emerald-700 border-emerald-200',
        warning:
          'border-transparent bg-amber-100 text-amber-700 border-amber-200',
        info:
          'border-transparent bg-blue-100 text-blue-700 border-blue-200',
        purple:
          'border-transparent bg-violet-100 text-violet-700 border-violet-200',
        pending:
          'border-transparent bg-orange-100 text-orange-700 border-orange-200',
        active:
          'border-transparent bg-emerald-100 text-emerald-700 border-emerald-200',
        inactive:
          'border-transparent bg-slate-100 text-slate-600 border-slate-200',
        cancelled:
          'border-transparent bg-red-100 text-red-700 border-red-200',
        completed:
          'border-transparent bg-blue-100 text-blue-700 border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
