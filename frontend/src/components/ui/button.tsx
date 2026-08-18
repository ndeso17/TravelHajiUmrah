import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-60 disabled:pointer-events-none';

    const styles = {
      default: 'bg-gold-cta text-[#361f12] hover:bg-gold-light',
      outline: 'border border-ink/20 text-ink hover:bg-surface-muted',
      ghost: 'text-ink hover:bg-surface-muted',
    };

    const sizes = {
      sm: 'min-h-9 px-4 py-2 text-sm',
      md: 'min-h-11 px-6 py-3 text-sm',
      lg: 'min-h-[52px] px-8 py-4 text-base',
    };

    return (
      <button ref={ref} type={type} className={cn(base, styles[variant], sizes[size], className)} {...props} />
    );
  },
);