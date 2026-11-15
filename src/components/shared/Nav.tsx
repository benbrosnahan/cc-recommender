'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ACTIVE_CARDS } from '@/data/cards';

export function Nav() {
  const path = usePathname();
  const onCards = path === '/cards';

  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 pt-5 sm:px-6 sm:pt-7">
      <Link
        href="/"
        className="inline-flex min-h-[40px] flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-4"
      >
        {/* accent-hover, not accent: #C1652E on the page is under 4.5:1. */}
        <span className="font-display text-lg font-bold text-accent-hover sm:text-xl">Cense</span>
        <span className="font-display text-lg font-bold text-slate-900 sm:text-xl">Card Picker</span>
      </Link>
      <nav aria-label="Main" className="flex flex-shrink-0 items-center gap-1.5">
        <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-slate-800 sm:inline-flex">
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1.8 2.8 4v3.6c0 3 2.1 5.5 5.2 6.6 3.1-1.1 5.2-3.6 5.2-6.6V4L8 1.8Z" />
          </svg>
          No affiliate links
        </span>
        <Link
          href={onCards ? '/' : '/cards'}
          className={cn(
            'inline-flex min-h-[40px] items-center rounded-full px-3 text-sm font-semibold text-slate-800',
            'transition-colors hover:bg-slate-100 hover:text-slate-900',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2'
          )}
        >
          {onCards ? 'Find my card' : `All ${ACTIVE_CARDS.length} cards`}
        </Link>
      </nav>
    </header>
  );
}
