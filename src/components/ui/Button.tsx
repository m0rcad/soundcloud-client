import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold rounded-full transition-all duration-150 active:scale-[0.98] focus:outline-none disabled:opacity-40 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'bg-sc-accent hover:bg-sc-accent-hover active:bg-sc-accent-active text-white shadow-sm',
    secondary:
      'bg-sc-surface-2 hover:bg-sc-hover active:bg-sc-surface-3 text-white border border-sc-border',
    ghost:
      'bg-transparent hover:bg-sc-hover text-sc-text-secondary hover:text-white',
    danger:
      'bg-sc-danger hover:brightness-110 active:brightness-90 text-white shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4.5 py-2 gap-2',
    lg: 'text-sm sm:text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
