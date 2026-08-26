'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecommendationResult } from '@/types';
import { creditTierLabel, formatDollars, spendBucketLabel, spendBucketMonthlyMidpoint } from '@/lib/utils';

interface Props {
  result: RecommendationResult;
}

export function MethodologySection({ result }: Props) {
  const [open, setOpen] = useState(false);
  const { quizAnswers } = result;
  const monthlyMidpoint = quizAnswers.spendBucket
    ? spendBucketMonthlyMidpoint(quizAnswers.spendBucket)
    : 300;
  const annualSpend = monthlyMidpoint * 12;

  const cats = quizAnswers.spendingCategories;
  const isEvenSplit = cats.includes('even_split');

  function allocationDescription() {
    if (isEvenSplit)
      return 'Spending split equally across dining, groceries, gas, online shopping, streaming, and transit.';
    if (cats.length === 1)
      return `80% of spending allocated to ${cats[0].replace('_', ' ')}, 20% at the base rate.`;
    if (cats.length === 2)
      return `45% to ${cats[0].replace('_', ' ')}, 35% to ${cats[1].replace('_', ' ')}, 20% at base rates.`;
    return `40% to ${cats[0].replace('_', ' ')}, 30% to ${cats[1]?.replace('_', ' ')}, 20% to ${cats[2]?.replace('_', ' ')}, 10% at base rates.`;
  }

  return (
    <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div>
          <p className="font-semibold text-slate-800 text-sm">How we calculated these estimates</p>
          <p className="text-xs text-slate-400 mt-0.5">Tap to see the full methodology</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-slate-100">
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">Credit score</p>
                    <p className="font-semibold text-slate-800">
                      {quizAnswers.creditTier ? creditTierLabel(quizAnswers.creditTier) : '—'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">Monthly spend used</p>
                    <p className="font-semibold text-slate-800">{formatDollars(monthlyMidpoint)}/mo</p>
                    <p className="text-xs text-slate-400">
                      {quizAnswers.spendBucket ? spendBucketLabel(quizAnswers.spendBucket) : '—'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">Annual spend used</p>
                    <p className="font-semibold text-slate-800">{formatDollars(annualSpend)}/yr</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">International travel</p>
                    <p className="font-semibold text-slate-800 capitalize">{quizAnswers.travelIntent ?? '—'}</p>
                    {quizAnswers.travelIntent === 'yes' && (
                      <p className="text-xs text-slate-400">20% of spend assumed international</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 font-medium mb-1">Spending allocation</p>
                  <p className="text-slate-700 leading-relaxed">{allocationDescription()}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 leading-relaxed">
                  <p>
                    <span className="font-semibold text-slate-700">Rotating categories (Discover, Freedom Flex):</span>{' '}
                    The 5% rate was applied to 50% of applicable category spend — modeling that roughly 2 of 4 quarterly categories match your top categories each year.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Cashback Match (Discover):</span>{' '}
                    Year-one earnings are doubled — Discover matches all cash back earned in the first 12 months with no cap.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Miles conversion:</span>{' '}
                    All miles-based rewards converted at 1 cent per mile (a conservative estimate for most redemptions).
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Citi Custom Cash:</span>{' '}
                    5% automatically applied to your top spending category, capped at $500/month in that category.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Foreign transaction fees:</span>{' '}
                    If you indicated international travel, 20% of annual spend is assumed to occur abroad. Cards with a 3% FTF are penalized accordingly.
                  </p>
                </div>

                <p className="text-xs text-slate-400 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  These are projections based on the spending habits you described and publicly available card terms at the time of publication. Actual earnings will vary. Always verify card terms before applying.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
