'use client';

// Shared primitives, matched to Loan Desk. Type floor is 13px, primary
// controls are 48px tall, secondary controls 40px.

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-3xl border border-line bg-white shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

/** Small caps label above a section or a figure. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs font-semibold uppercase tracking-[0.08em] text-slate-600', className)}>
      {children}
    </p>
  );
}

const buttonBase = cn(
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
  'transition-[background-color,border-color,color,transform] duration-150',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
  'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100'
);

export function buttonClass(
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'sm' | 'md' = 'md',
  className?: string
) {
  return cn(
    buttonBase,
    size === 'sm' ? 'min-h-[40px] px-4 py-2 text-sm' : 'min-h-[48px] px-5 py-3 text-base',
    variant === 'primary' && 'bg-navy text-white hover:bg-navy-hover',
    variant === 'secondary' &&
      'border border-slate-300 bg-white text-slate-900 hover:border-navy hover:bg-slate-100',
    variant === 'ghost' && 'text-slate-800 hover:bg-slate-100 hover:text-slate-900',
    className
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}) {
  return <button className={buttonClass(variant, size, className)} {...rest} />;
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'brand' | 'accent';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        tone === 'neutral' && 'bg-slate-100 text-slate-800',
        tone === 'brand' && 'bg-navy text-white',
        tone === 'accent' && 'bg-accent-light text-accent-deep',
        className
      )}
    >
      {children}
    </span>
  );
}

/** The one caution on a card. Colour is paired with a mark and a label. */
export function Caution({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-2xl bg-accent-light/60 p-4', className)}>
      <span
        aria-hidden
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-deep text-xs font-bold text-white"
      >
        !
      </span>
      <p className="text-sm leading-relaxed text-accent-deep">
        <span className="font-bold">One thing to know. </span>
        {children}
      </p>
    </div>
  );
}

/** Progressive disclosure, per the W3C APG disclosure pattern. */
export function Disclosure({
  summary,
  openSummary,
  children,
  className,
}: {
  summary: string;
  openSummary?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          '-mx-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 py-2 text-left',
          'text-sm font-semibold text-navy underline decoration-brand-border underline-offset-4',
          'transition-colors hover:bg-brand-light hover:decoration-navy',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2'
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-200', open && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5 10.5 8 6 12.5" />
        </svg>
        {open ? openSummary ?? summary : summary}
      </button>
      {open && (
        <div id={id} className="unfold pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

export function ArrowOut({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cn('h-4 w-4', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}
