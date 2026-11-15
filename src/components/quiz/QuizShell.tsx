'use client';

import { ProgressBar } from '@/components/shared/ProgressBar';
import { Button } from '@/components/shared/ui';

interface QuizShellProps {
  step: number;
  total: number;
  onBack: () => void;
  children: React.ReactNode;
}

export function QuizShell({ step, total, onBack, children }: QuizShellProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12">
      <div className="max-w-xl">
        <ProgressBar current={step} total={total} />
        {/* Keyed on the step so each question plays the CSS entrance once. */}
        <div key={step} className="rise mt-8">
          {children}
        </div>
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3 mt-3">
          <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {step === 1 ? 'Back to start' : 'Previous question'}
        </Button>
      </div>
    </div>
  );
}

/** Headline, one line of why we ask, the options, and one button. */
export function StepFrame({
  title,
  why,
  children,
  action,
  canContinue,
  onNext,
  groupRole = 'radiogroup',
}: {
  title: string;
  why: string;
  children: React.ReactNode;
  action: string;
  canContinue: boolean;
  onNext: () => void;
  groupRole?: 'radiogroup' | 'group';
}) {
  return (
    <div>
      <h1 className="text-balance font-display text-3xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-[2.6rem]">
        {title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-700">{why}</p>
      <div role={groupRole} aria-label={title} className="mt-6">
        {children}
      </div>
      <Button onClick={onNext} disabled={!canContinue} className="mt-6 w-full sm:w-auto sm:min-w-[220px]">
        {action}
      </Button>
    </div>
  );
}
