import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'pill' | 'grid';
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  className,
  variant = 'pill',
}) => {
  if (variant === 'grid') {
    return (
      <div
        className={twMerge(
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 p-2 rounded-sc-card bg-sc-surface border border-sc-border select-none',
          className
        )}
      >
        {items.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'px-3 py-2.5 rounded-sc text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 outline-none select-none text-center border',
                isActive
                  ? 'bg-sc-surface-2 text-white shadow-sm border-sc-border-strong ring-1 ring-white/10'
                  : 'bg-sc-surface-2/40 border-sc-border/60 text-sc-text-secondary hover:text-white hover:bg-sc-surface-2 hover:border-sc-border'
              )}
            >
              {tab.icon && (
                <span className={clsx('shrink-0', isActive ? 'text-sc-accent' : 'text-sc-text-tertiary')}>
                  {tab.icon}
                </span>
              )}
              <span className="truncate">{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={clsx(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                    isActive
                      ? 'bg-black/30 text-white'
                      : 'bg-white/10 text-sc-text-tertiary'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-1.5 p-1 rounded-full bg-sc-surface border border-sc-border select-none overflow-x-auto scrollbar-none',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 flex items-center gap-2 outline-none select-none shrink-0',
              isActive
                ? 'bg-sc-surface-2 text-white shadow-sm border border-white/10'
                : 'text-sc-text-secondary hover:text-white hover:bg-white/5'
            )}
          >
            {tab.icon && (
              <span className={clsx('shrink-0', isActive ? 'text-sc-accent' : 'text-sc-text-tertiary')}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive
                    ? 'bg-black/30 text-white'
                    : 'bg-white/10 text-sc-text-tertiary'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
