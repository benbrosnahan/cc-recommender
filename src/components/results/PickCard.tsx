'use client';

import { CardCalculation, QuizAnswers } from '@/types';
import {
  bestEverydayRate,
  cn,
  creditNeeded,
  figures,
  firstYearExtraName,
  formatDollars,
} from '@/lib/utils';
import { generateCaveat, generateWhyBullets } from '@/lib/copy-generator';
import { ArrowOut, Badge, Card, Caution, Disclosure, Eyebrow, buttonClass } from '@/components/shared/ui';
import { EarningsBar, LegendDot } from './EarningsBar';

const RANK_LABEL = ['Top pick', 'Second pick', 'Third pick'];

interface Props {
  calc: CardCalculation;
  rank: 0 | 1 | 2;
  answers: QuizAnswers;
  scaleMax: number;
}

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="mt-1 h-4 w-4 flex-shrink-0 text-chart-green">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function Facts({ calc }: { calc: CardCalculation }) {
  const { card } = calc;
  const rows = [
    ['Annual fee', '$0'],
    ['Fee abroad', card.foreignTransactionFee > 0 ? '3% per purchase' : 'None'],
    ['Credit score needed', creditNeeded(card)],
    ['Best everyday rate', bestEverydayRate(card)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-semibold text-slate-600">{k}</dt>
          <dd className="mt-0.5 text-sm font-semibold leading-snug text-slate-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Breakdown({ calc }: { calc: CardCalculation }) {
  const { yearOne } = figures(calc);
  return (
    <Disclosure
      summary={`Where the ${formatDollars(yearOne)} comes from`}
      openSummary="Hide the breakdown"
    >
      <ul className="tnum space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
        {calc.earningsBreakdown.map((line, i) => {
          const firstYear = line.isBonus && !line.isDeduction;
          return (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="flex items-baseline gap-2 text-slate-800">
                <span className="translate-y-[1px]">
                  <LegendDot kind={firstYear ? 'extra' : 'later'} />
                </span>
                {line.label}
              </span>
              <span className={cn('font-semibold', line.isDeduction ? 'text-accent-deep' : 'text-slate-900')}>
                {line.isDeduction ? '-' : '+'}
                {formatDollars(Math.abs(line.annualAmount))}
              </span>
            </li>
          );
        })}
        <li className="flex items-baseline justify-between gap-3 border-t border-line pt-2 font-bold text-slate-900">
          <span>Year one</span>
          <span>{formatDollars(yearOne)}</span>
        </li>
      </ul>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Based on {formatDollars(calc.monthlySpendUsed)} a month on the card, paid off in full.
      </p>
    </Disclosure>
  );
}

export function PickCard({ calc, rank, answers, scaleMax }: Props) {
  const { card } = calc;
  const top = rank === 0;
  const { later, extra, yearOne } = figures(calc);
  const why = generateWhyBullets(calc, answers).slice(0, top ? 3 : 2);
  const caveat = generateCaveat(calc, answers);
  const extraName = firstYearExtraName(calc);

  return (
    <Card className={cn('flex flex-col', top ? 'p-6 shadow-lift sm:p-8' : 'p-5 sm:p-6')}>
      <div className="flex items-center justify-between gap-3">
        <Badge tone={top ? 'brand' : 'neutral'}>{RANK_LABEL[rank]}</Badge>
        <span className="text-sm font-semibold text-slate-600">{card.issuer}</span>
      </div>

      <h2
        className={cn(
          'mt-3 text-balance font-display font-bold leading-[1.1] tracking-tight text-slate-900',
          top ? 'text-[1.75rem] sm:text-4xl' : 'text-xl sm:text-2xl'
        )}
      >
        {card.name}
      </h2>
      <p className={cn('mt-1.5 leading-snug text-slate-700', top ? 'text-base' : 'text-sm')}>{card.tagline}</p>

      {/* The answer: what it pays in year one, and what is left after that. */}
      <div className={cn('flex flex-wrap items-end gap-x-8 gap-y-3', top ? 'mt-7' : 'mt-5')}>
        <div>
          <Eyebrow>Back in year one</Eyebrow>
          <p className={cn('figure mt-1 font-bold leading-none text-slate-900', top ? 'text-6xl sm:text-7xl' : 'text-4xl')}>
            {formatDollars(yearOne)}
          </p>
        </div>
        <div className={top ? 'pb-1' : 'pb-0.5'}>
          <Eyebrow>Then every year</Eyebrow>
          <p className={cn('figure mt-1 font-bold leading-none text-slate-700', top ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
            {formatDollars(later)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {/* Only the top pick draws its own bar. The other two are already on
            the shared scale just above them, and a third copy adds nothing. */}
        {top && (
          <EarningsBar
            later={later}
            extra={extra}
            scaleMax={scaleMax}
            size="lg"
            delay={0.15}
            label={`${formatDollars(later)} a year from your spending${extra > 0 ? `, plus ${formatDollars(extra)} from the ${extraName} in the first year only` : ''}`}
          />
        )}
        <ul
          className={cn(
            'flex flex-col gap-1.5 text-sm text-slate-800',
            top && 'mt-3 sm:flex-row sm:flex-wrap sm:gap-x-5'
          )}
        >
          <li className="flex items-center gap-2">
            <LegendDot kind="later" />
            <span>
              <span className="tnum font-semibold">{formatDollars(later)}</span> on your spending, every year
            </span>
          </li>
          {extra > 0 && (
            <li className="flex items-center gap-2">
              <LegendDot kind="extra" />
              <span>
                <span className="tnum font-semibold">{formatDollars(extra)}</span> {extraName}, first year only
              </span>
            </li>
          )}
        </ul>
      </div>

      {why.length > 0 && (
        <div className={top ? 'mt-7' : 'mt-5'}>
          <Eyebrow>Why it fits you</Eyebrow>
          <ul className="mt-2 space-y-2">
            {why.map((b, i) => (
              <li key={i} className={cn('flex gap-2.5 leading-snug text-slate-800', top ? 'text-base' : 'text-sm')}>
                <Check />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Caution className="mt-5">{caveat}</Caution>

      <div className="mt-5">
        <Facts calc={calc} />
      </div>

      <div className="mt-auto pt-5">
        <a
          href={card.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass(top ? 'primary' : 'secondary', 'md', 'w-full sm:w-auto')}
        >
          See this card at {card.issuer}
          <ArrowOut />
        </a>
        <div className="mt-2">
          <Breakdown calc={calc} />
        </div>
      </div>
    </Card>
  );
}
