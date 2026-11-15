'use client';

import Link from 'next/link';
import { RecommendationResult } from '@/types';
import { answerSummary, figures, formatDollars, spendBucketMonthlyMidpoint } from '@/lib/utils';
import { Badge, buttonClass } from '@/components/shared/ui';
import { PickCard } from './PickCard';
import { CompareBars } from './CompareBars';
import { Methodology } from './Methodology';

interface Props {
  result: RecommendationResult;
  isExample: boolean;
}

export function ResultsPage({ result, isExample }: Props) {
  const { top3, quizAnswers } = result;
  // One scale for every bar on the page, set by the largest first-year figure.
  const scaleMax = Math.max(...top3.map((c) => figures(c).yearOne), 1);
  const monthly = spendBucketMonthlyMidpoint(quizAnswers.spendBucket ?? 'under_500');
  const adjusted = quizAnswers.priority && quizAnswers.priority !== 'maximize_cash';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="rise">
        {isExample && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-light p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 text-sm leading-relaxed text-slate-800 sm:flex-1">
              <span className="font-bold text-slate-900">This is an example. </span>
              It is worked out for a student with no credit history who spends about $750 a month,
              mostly on eating out and groceries.
            </p>
            <Link href="/" className={buttonClass('primary', 'sm', 'self-start sm:self-auto')}>
              Use my own answers
            </Link>
          </div>
        )}

        <h1 className="text-balance font-display text-[2.1rem] font-bold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl">
          Three cards that fit, best first.
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-slate-700 sm:text-lg">
          Ranked by the dollars each would pay you back at about {formatDollars(monthly)} a month
          {adjusted ? ', then adjusted for what you said matters most' : ''}. None has an annual fee.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {answerSummary(quizAnswers).map((a) => (
            <Badge key={a}>{a}</Badge>
          ))}
          {!isExample && (
            <Link
              href="/"
              className="ml-1 inline-flex min-h-[40px] items-center text-sm font-semibold text-slate-900 underline decoration-brand-border underline-offset-4 hover:decoration-navy"
            >
              Start over
            </Link>
          )}
        </div>
      </div>

      <div className="rise mt-8" style={{ animationDelay: '0.06s' }}>
        <PickCard calc={top3[0]} rank={0} answers={quizAnswers} scaleMax={scaleMax} />
      </div>

      {top3.length > 1 && (
        <>
          <div className="rise mt-5" style={{ animationDelay: '0.12s' }}>
            <CompareBars top3={top3} scaleMax={scaleMax} />
          </div>
          <div className="rise mt-5 grid gap-5 md:grid-cols-2" style={{ animationDelay: '0.18s' }}>
            {top3.slice(1).map((calc, i) => (
              <PickCard
                key={calc.card.id}
                calc={calc}
                rank={(i + 1) as 1 | 2}
                answers={quizAnswers}
                scaleMax={scaleMax}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-8">
        <Methodology result={result} />
      </div>
    </div>
  );
}
