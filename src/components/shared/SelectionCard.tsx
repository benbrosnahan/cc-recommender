'use client';

import { cn } from '@/lib/utils';

interface SelectionCardProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** Single-choice steps are radios, the pick-up-to-three step is checkboxes. */
  role?: 'radio' | 'checkbox';
  className?: string;
}

export function SelectionCard({
  label,
  description,
  icon,
  selected,
  onClick,
  disabled,
  role = 'radio',
  className,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex min-h-[60px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left',
        'transition-[background-color,border-color,transform] duration-150 active:scale-[0.99]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
        selected
          ? 'border-navy bg-brand-light'
          : 'border-slate-300 bg-white hover:border-navy hover:bg-slate-50',
        disabled && !selected && 'cursor-not-allowed opacity-45 hover:border-slate-300 hover:bg-white',
        className
      )}
    >
      {icon && <span className="flex-shrink-0 text-slate-600">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold leading-snug text-slate-900">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm leading-snug text-slate-600">{description}</span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center border-2 transition-colors',
          role === 'checkbox' ? 'rounded-lg' : 'rounded-full',
          selected ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-transparent'
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    </button>
  );
}
