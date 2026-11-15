'use client';

import { useReducer } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QuizAnswers, CreditTier, SpendingCategory, SpendBucket, TravelIntent, Priority } from '@/types';
import { QuizShell } from '@/components/quiz/QuizShell';
import { StepCreditScore } from '@/components/quiz/StepCreditScore';
import { StepSpending } from '@/components/quiz/StepSpending';
import { StepMonthlySpend } from '@/components/quiz/StepMonthlySpend';
import { StepTravel } from '@/components/quiz/StepTravel';
import { StepPriority } from '@/components/quiz/StepPriority';
import { Button, Card, Eyebrow, buttonClass } from '@/components/shared/ui';
import { ACTIVE_CARDS, EXCLUDED_CARDS } from '@/data/cards';

const TOTAL_STEPS = 5;
const ANSWERS_KEY = 'cc-answers';

interface QuizState {
  // 0 is the opening screen, 1 to 5 are the questions
  step: number;
  answers: QuizAnswers;
}

type QuizAction =
  | { type: 'SET_CREDIT_TIER'; payload: CreditTier }
  | { type: 'SET_SPENDING'; payload: SpendingCategory[] }
  | { type: 'SET_SPEND_BUCKET'; payload: SpendBucket }
  | { type: 'SET_TRAVEL'; payload: TravelIntent }
  | { type: 'SET_PRIORITY'; payload: Priority }
  | { type: 'NEXT' }
  | { type: 'BACK' };

const initialState: QuizState = {
  step: 0,
  answers: {
    creditTier: null,
    spendingCategories: [],
    spendBucket: null,
    travelIntent: null,
    priority: null,
  },
};

function reducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_CREDIT_TIER':
      return { ...state, answers: { ...state.answers, creditTier: action.payload } };
    case 'SET_SPENDING':
      return { ...state, answers: { ...state.answers, spendingCategories: action.payload } };
    case 'SET_SPEND_BUCKET':
      return { ...state, answers: { ...state.answers, spendBucket: action.payload } };
    case 'SET_TRAVEL':
      return { ...state, answers: { ...state.answers, travelIntent: action.payload } };
    case 'SET_PRIORITY':
      return { ...state, answers: { ...state.answers, priority: action.payload } };
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 0) };
    default:
      return state;
  }
}

function Opening({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6 sm:pt-16">
      <div className="rise">
        <h1 className="text-balance font-display text-[2.3rem] font-bold leading-[1.04] tracking-tight text-slate-900 sm:text-6xl">
          Your first credit card, in dollars.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-slate-700">
          Card sites talk in points, and most are paid when you apply. Answer five questions and
          see three no-annual-fee cards, with what each would pay you back in the first year and
          in every year after it.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={onStart} className="w-full sm:w-auto sm:min-w-[200px]">
            Find my card
          </Button>
          <Link href="/results?example=1" className={buttonClass('secondary', 'md', 'w-full sm:w-auto')}>
            See an example result first
          </Link>
        </div>
      </div>

      <div className="rise mt-8 grid gap-3 sm:grid-cols-2" style={{ animationDelay: '0.08s' }}>
        <Card className="p-5">
          <Eyebrow>What you will need</Eyebrow>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            A rough idea of what you spend in a month and where it goes. A guess is fine.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            No Social Security number, no credit check, no email. It takes about a minute.
          </p>
        </Card>
        <Card className="p-5">
          <Eyebrow>What we left out</Eyebrow>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            Every card with an annual fee. Nobody should pay a fee to build a first credit history.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            <Link
              href="/cards"
              className="font-semibold text-slate-900 underline decoration-brand-border underline-offset-4 hover:decoration-navy"
            >
              See all {ACTIVE_CARDS.length} cards we compare
            </Link>
            , and the {EXCLUDED_CARDS.length} we looked at and rejected.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  function handleFinalStep() {
    if (!state.answers.priority) return;
    // Only the answers are kept. The results page works the numbers out fresh,
    // so a change to the card data never shows a stale result.
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(state.answers));
    router.push('/results');
  }

  if (state.step === 0) return <Opening onStart={() => dispatch({ type: 'NEXT' })} />;

  const next = () => dispatch({ type: 'NEXT' });

  return (
    <QuizShell step={state.step} total={TOTAL_STEPS} onBack={() => dispatch({ type: 'BACK' })}>
      {state.step === 1 && (
        <StepCreditScore
          value={state.answers.creditTier}
          onChange={(v) => dispatch({ type: 'SET_CREDIT_TIER', payload: v })}
          onNext={next}
        />
      )}
      {state.step === 2 && (
        <StepSpending
          value={state.answers.spendingCategories}
          onChange={(v) => dispatch({ type: 'SET_SPENDING', payload: v })}
          onNext={next}
        />
      )}
      {state.step === 3 && (
        <StepMonthlySpend
          value={state.answers.spendBucket}
          onChange={(v) => dispatch({ type: 'SET_SPEND_BUCKET', payload: v })}
          onNext={next}
        />
      )}
      {state.step === 4 && (
        <StepTravel
          value={state.answers.travelIntent}
          onChange={(v) => dispatch({ type: 'SET_TRAVEL', payload: v })}
          onNext={next}
        />
      )}
      {state.step === 5 && (
        <StepPriority
          value={state.answers.priority}
          onChange={(v) => dispatch({ type: 'SET_PRIORITY', payload: v })}
          onNext={handleFinalStep}
        />
      )}
    </QuizShell>
  );
}
