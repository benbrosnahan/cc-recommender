'use client';

import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { CardCalculation, QuizAnswers } from '@/types';
import { formatDollars } from '@/lib/utils';
import { EarningsBreakdown } from './EarningsBreakdown';
import { generateWhyBullets, generateCaveat } from '@/lib/copy-generator';

const RANK_LABELS = ['Top Pick', 'Runner-up', 'Also consider'];
const RANK_COLORS = [
  'bg-[#275B2D] text-white',
  'bg-slate-700 text-white',
  'bg-slate-200 text-slate-700',
];

const ISSUER_COLORS: Record<string, string> = {
  Discover: 'bg-orange-100 text-orange-800',
  'Capital One': 'bg-red-100 text-red-800',
  Chase: 'bg-blue-100 text-blue-800',
  'Bank of America': 'bg-red-100 text-red-900',
  Citi: 'bg-sky-100 text-sky-800',
  'American Express': 'bg-emerald-100 text-emerald-800',
};

function AnimatedDollar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [display, setDisplay] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, delay]);

  return <span ref={nodeRef}>{formatDollars(display)}</span>;
}

interface Props {
  calc: CardCalculation;
  rank: 0 | 1 | 2;
  answers: QuizAnswers;
  animationDelay?: number;
}

export function CardResult({ calc, rank, answers, animationDelay = 0 }: Props) {
  const { card } = calc;
  const whyBullets = generateWhyBullets(calc, answers);
  const caveat = generateCaveat(calc, answers);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${RANK_COLORS[rank]}`}
          >
            {RANK_LABELS[rank]}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ISSUER_COLORS[card.issuer] ?? 'bg-slate-100 text-slate-700'}`}
          >
            {card.issuer}
          </span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 leading-snug">{card.name}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{card.tagline}</p>
      </div>

      {/* Year one value */}
      <div className="px-5 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          Estimated Year One Value
        </p>
        <p className="text-5xl font-black text-[#16A34A] leading-none">
          <AnimatedDollar value={calc.yearOneValue} delay={animationDelay} />
        </p>
        <p className="text-xs text-slate-400 mt-1.5">
          Based on your spending — see breakdown below
        </p>
      </div>

      {/* Breakdown */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          How we got there
        </p>
        <EarningsBreakdown lines={calc.earningsBreakdown} />
      </div>

      {/* Why bullets */}
      {whyBullets.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Why this card for you
          </p>
          <ul className="space-y-2">
            {whyBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 w-4 h-4 flex-shrink-0 text-[#16A34A]">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Caveat */}
      <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-amber-500 flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <p className="text-xs text-amber-800 leading-snug">{caveat}</p>
        </div>
      </div>

      {/* Apply */}
      <div className="px-5 py-4">
        <a
          href={card.applyUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="block w-full text-center py-3 bg-[#275B2D] text-white font-semibold rounded-xl hover:bg-[#1E4623] transition-colors text-sm"
        >
          Apply Now →
        </a>
        <p className="text-[11px] text-slate-400 text-center mt-2 leading-snug">
          Not financial advice.
        </p>
      </div>
    </div>
  );
}
