'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { QuizAnswers, RecommendationResult } from '@/types';
import { calculateRecommendations, EXAMPLE_ANSWERS } from '@/lib/calculator';
import { ResultsPage } from '@/components/results/ResultsPage';
import { buttonClass } from '@/components/shared/ui';

const ANSWERS_KEY = 'cc-answers';

type Loaded = { result: RecommendationResult | null; isExample: boolean };

// The answers live in the browser (the address bar or session storage), so
// they are read as an external store: nothing on the server, the real value
// on the client, and no state set from inside an effect.
const EXAMPLE = 'example';
const subscribe = () => () => {};
function readSource(): string {
  // /results?example=1 shows a worked example with no quiz, so the page can
  // be linked to directly.
  if (new URLSearchParams(window.location.search).has(EXAMPLE)) return EXAMPLE;
  return sessionStorage.getItem(ANSWERS_KEY) ?? '';
}

function load(source: string): Loaded {
  const isExample = source === EXAMPLE;
  let answers: QuizAnswers | null = isExample ? EXAMPLE_ANSWERS : null;
  if (!answers && source) {
    try {
      answers = JSON.parse(source) as QuizAnswers;
    } catch {
      answers = null;
    }
  }
  return { result: answers ? calculateRecommendations(answers) : null, isExample };
}

export default function Results() {
  const source = useSyncExternalStore(subscribe, readSource, () => null);
  const loaded = useMemo(() => (source === null ? null : load(source)), [source]);

  if (!loaded) return <div className="min-h-[60vh]" />;

  if (!loaded.result || loaded.result.top3.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-slate-900">No answers yet</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-700">
          The three cards are worked out from five questions about how you spend. Your answers are
          not saved between visits, so there is nothing to show until you answer them.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/" className={buttonClass('primary')}>
            Answer the five questions
          </Link>
          <a href="/results?example=1" className={buttonClass('secondary')}>
            See an example result
          </a>
        </div>
      </div>
    );
  }

  return <ResultsPage result={loaded.result} isExample={loaded.isExample} />;
}
