'use client';

import { useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { QuizAnswers, CreditTier, SpendingCategory, SpendBucket, TravelIntent, Priority } from '@/types';
import { QuizShell } from '@/components/quiz/QuizShell';
import { StepCreditScore } from '@/components/quiz/StepCreditScore';
import { StepSpending } from '@/components/quiz/StepSpending';
import { StepMonthlySpend } from '@/components/quiz/StepMonthlySpend';
import { StepTravel } from '@/components/quiz/StepTravel';
import { StepPriority } from '@/components/quiz/StepPriority';
import { calculateRecommendations } from '@/lib/calculator';

const TOTAL_STEPS = 5;

interface QuizState {
  step: number;
  answers: QuizAnswers;
  direction: 1 | -1;
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
  step: 1,
  direction: 1,
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
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS), direction: 1 };
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 1), direction: -1 };
    default:
      return state;
  }
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function QuizPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  function handleNext() {
    if (state.step < TOTAL_STEPS) {
      dispatch({ type: 'NEXT' });
    }
  }

  function handleFinalStep() {
    if (!state.answers.priority) return;
    const result = calculateRecommendations(state.answers);
    sessionStorage.setItem('cc-recommendation', JSON.stringify(result));
    router.push('/results');
  }

  return (
    <div className="relative overflow-hidden">
      {state.step > 1 && (
        <div className="max-w-xl mx-auto px-4 pt-4">
          <button
            onClick={() => dispatch({ type: 'BACK' })}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        </div>
      )}

      <QuizShell step={state.step} total={TOTAL_STEPS}>
        <AnimatePresence mode="wait" custom={state.direction}>
          <motion.div
            key={state.step}
            custom={state.direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {state.step === 1 && (
              <StepCreditScore
                value={state.answers.creditTier}
                onChange={(v) => dispatch({ type: 'SET_CREDIT_TIER', payload: v })}
                onNext={handleNext}
              />
            )}
            {state.step === 2 && (
              <StepSpending
                value={state.answers.spendingCategories}
                onChange={(v) => dispatch({ type: 'SET_SPENDING', payload: v })}
                onNext={handleNext}
              />
            )}
            {state.step === 3 && (
              <StepMonthlySpend
                value={state.answers.spendBucket}
                onChange={(v) => dispatch({ type: 'SET_SPEND_BUCKET', payload: v })}
                onNext={handleNext}
              />
            )}
            {state.step === 4 && (
              <StepTravel
                value={state.answers.travelIntent}
                onChange={(v) => dispatch({ type: 'SET_TRAVEL', payload: v })}
                onNext={handleNext}
              />
            )}
            {state.step === 5 && (
              <StepPriority
                value={state.answers.priority}
                onChange={(v) => dispatch({ type: 'SET_PRIORITY', payload: v })}
                onNext={handleFinalStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </QuizShell>
    </div>
  );
}
