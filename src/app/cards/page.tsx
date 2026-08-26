'use client';

import { useState } from 'react';
import { ACTIVE_CARDS, EXCLUDED_CARDS } from '@/data/cards';
import { UniverseCard } from '@/components/cards/UniverseCard';
import { CreditCard } from '@/types';

type FilterTag = 'all' | 'student' | 'travel' | 'cash_back' | 'credit_building' | 'airline';

const FILTERS: { value: FilterTag; label: string }[] = [
  { value: 'all', label: 'All cards' },
  { value: 'student', label: 'Student cards' },
  { value: 'cash_back', label: 'Cash back' },
  { value: 'travel', label: 'Travel' },
  { value: 'airline', label: 'Airline' },
  { value: 'credit_building', label: 'Credit building' },
];

function matches(card: CreditCard, filter: FilterTag): boolean {
  if (filter === 'all') return true;
  return card.filterTags.includes(filter);
}

export default function CardsPage() {
  const [filter, setFilter] = useState<FilterTag>('all');

  const active = ACTIVE_CARDS.filter((c) => matches(c, filter));
  const excluded = EXCLUDED_CARDS;
  const showExcluded = filter === 'all';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Cards We Consider</h1>
        <div className="bg-[#EAF3E7] border border-[#275B2D]/20 rounded-xl p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            We evaluated every widely-available student-appropriate credit card with{' '}
            <strong>no annual fee</strong>. Annual fees were an immediate disqualifier — students
            building credit shouldn&apos;t pay to build credit. Here&apos;s every card we
            considered, and why.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#275B2D] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Active cards */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          {active.length} card{active.length !== 1 ? 's' : ''} in our recommendation pool
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {active.map((card) => (
            <UniverseCard key={card.id} card={card} />
          ))}
          {active.length === 0 && (
            <p className="col-span-2 text-slate-500 text-sm py-4">
              No cards match this filter.
            </p>
          )}
        </div>
      </div>

      {/* Excluded cards */}
      {showExcluded && excluded.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Cards we researched but excluded
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            These cards were evaluated but are not surfaced in recommendations. We&apos;re
            transparent about why.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {excluded.map((card) => (
              <UniverseCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
