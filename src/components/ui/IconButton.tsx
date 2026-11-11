import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'accent';
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'md',
  variant = 'ghost',
  active = false,
  className,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 focus:outline-none select-none disabled:opacity-40 disabled:pointer-events-none';

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const variants = {
    ghost: active
      ? 'text-sc-accent bg-sc-accent/15 hover:bg-sc-accent/25'
      : 'text-sc-text-secondary hover:text-white hover:bg-sc-hover',
    secondary: 'bg-sc-surface hover:bg-sc-hover text-sc-text-secondary hover:text-white border border-sc-border',
    accent: 'bg-sc-accent hover:bg-sc-accent-hover text-white shadow-md shadow-sc-accent/25',
  };

  return (
    <button
      className={twMerge(clsx(base, sizes[size], variants[variant], className))}
      {...props}
    >
      {children}
    </button>
  );
};
