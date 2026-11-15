'use client';

import { RecommendationResult } from '@/types';
import { formatDollars, spendBucketMonthlyMidpoint } from '@/lib/utils';
import { TERMS_CHECKED_LABEL } from '@/data/cards';
import { Disclosure } from '@/components/shared/ui';
import { CHASE_SAPPHIRE_NOTE } from '@/lib/copy-generator';

interface Props {
  result: RecommendationResult;
}

const WORD: Record<string, string> = {
  dining: 'eating out',
  groceries: 'groceries',
  coffee: 'coffee',
  online_shopping: 'online shopping',
  streaming: 'streaming',
  gas: 'gas',
  transit: 'transit',
  travel: 'travel',
};

// Every assumption behind the numbers, in the order it is applied. A dollar
// figure built on hidden assumptions is worse than no number.
export function Methodology({ result }: Props) {
  const { quizAnswers } = result;
  const monthly = spendBucketMonthlyMidpoint(quizAnswers.spendBucket ?? 'under_500');
  const cats = quizAnswers.spendingCategories.map((c) => WORD[c] ?? c);
  const even = quizAnswers.spendingCategories.includes('even_split') || cats.length === 0;

  const split = even
    ? 'split evenly across eating out, groceries, gas, online shopping, streaming and transit'
    : cats.length === 1
    ? `80% on ${cats[0]} and 20% on everything else`
    : cats.length === 2
    ? `45% on ${cats[0]}, 35% on ${cats[1]} and 20% on everything else`
    : `40% on ${cats[0]}, 30% on ${cats[1]}, 20% on ${cats[2]} and 10% on everything else`;

  const rows: [string, string][] = [
    [
      'Your spending',
      `You picked a range, so we used a point inside it: ${formatDollars(monthly)} a month, or ${formatDollars(monthly * 12)} a year, ${split}.`,
    ],
    [
      'Rotating 5% categories',
      "Discover and Chase Freedom Flex pay 5% on up to $1,500 a quarter, on categories that change. We use each bank's 2026 calendar and assume next year looks the same. It may not.",
    ],
    [
      'Coffee and caps',
      'Coffee shops count as eating out, because banks code them as restaurants. Where a cap covers several categories, it is shared in proportion to what you spend.',
    ],
    [
      'First-year extras',
      'A welcome bonus only counts if your spending would reach its requirement in time. Discover matches everything you earn in the first 12 months, so its match equals a full year of rewards. Bank of America pays an extra 3% in the category you choose for one year, so that is counted as first-year money too.',
    ],
    ['Miles', 'Counted at 1 cent each, which is on the low side for most redemptions.'],
    ...(quizAnswers.priority === 'travel_rewards'
      ? ([
          [
            'Your travel priority',
            `Cards with no fee abroad move up the list, and cards whose points can go to airlines and hotels move up most. That lift changes the order only, not the dollars shown. For Chase points it is a later step: ${CHASE_SAPPHIRE_NOTE}`,
          ],
        ] as [string, string][])
      : []),
    [
      'Spending abroad',
      quizAnswers.travelIntent === 'yes'
        ? 'You said you will spend abroad, so we assume a fifth of your spending happens there and subtract the 3% fee on cards that charge one.'
        : 'Cards with a 3% fee abroad are only marked down if you say you will travel.',
    ],
    [
      'What is not counted',
      'Interest. Every number here assumes you pay the full balance each month. If you carry a balance, the interest will be larger than any reward on this page.',
    ],
    [
      'Card terms',
      `Checked on each bank's own page on ${TERMS_CHECKED_LABEL}. Banks change offers often, so check again before you apply.`,
    ],
  ];

  return (
    <Disclosure summary="How these numbers are worked out" openSummary="Hide how these numbers are worked out">
      <dl className="space-y-4 rounded-3xl border border-line bg-white p-5 sm:p-6">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm font-bold text-slate-900">{k}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
    </Disclosure>
  );
}
