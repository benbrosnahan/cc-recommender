'use client';

import { useState } from 'react';
import { ACTIVE_CARDS, EXCLUDED_CARDS, TERMS_CHECKED, TERMS_CHECKED_LABEL } from '@/data/cards';
import { UniverseCard } from '@/components/cards/UniverseCard';
import { CreditCard } from '@/types';
import { cn } from '@/lib/utils';

type FilterTag = 'all' | 'student' | 'travel' | 'cash_back' | 'credit_building' | 'airline';

const FILTERS: { value: FilterTag; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Student cards' },
  { value: 'credit_building', label: 'First card' },
  { value: 'cash_back', label: 'Cash back' },
  { value: 'travel', label: 'Travel' },
  { value: 'airline', label: 'Airline' },
];

function matches(card: CreditCard, filter: FilterTag): boolean {
  if (filter === 'all') return true;
  return card.filterTags.includes(filter);
}

export default function CardsPage() {
  const [filter, setFilter] = useState<FilterTag>('all');
  const active = ACTIVE_CARDS.filter((c) => matches(c, filter));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="rise">
        <h1 className="text-balance font-display text-[2.1rem] font-bold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl">
          Every card we compare, and the ones we rejected.
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-slate-700 sm:text-lg">
          {ACTIVE_CARDS.length} cards make up the pool your three picks come from. The one rule for
          getting in: no annual fee. Nobody should pay a fee to build a first credit history.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Terms checked on each bank&apos;s page on <time dateTime={TERMS_CHECKED}>{TERMS_CHECKED_LABEL}</time>.
        </p>
      </div>

      <div role="group" aria-label="Filter cards" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2',
              filter === f.value
                ? 'border-navy bg-navy text-white'
                : 'border-slate-300 bg-white text-slate-900 hover:border-navy hover:bg-slate-100'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
        {active.length} {active.length === 1 ? 'card' : 'cards'}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {active.map((card) => (
          <UniverseCard key={card.id} card={card} />
        ))}
      </div>

      {filter === 'all' && EXCLUDED_CARDS.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">
            Looked at, then left out
          </h2>
          <p className="mt-1.5 max-w-xl text-base leading-relaxed text-slate-700">
            These have no annual fee either, but they never show up in your picks. Each one says why.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {EXCLUDED_CARDS.map((card) => (
              <UniverseCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
