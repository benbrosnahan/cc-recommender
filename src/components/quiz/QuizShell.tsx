'use client';

import { ProgressBar } from '@/components/shared/ProgressBar';

interface QuizShellProps {
  step: number;
  total: number;
  children: React.ReactNode;
}

export function QuizShell({ step, total, children }: QuizShellProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <ProgressBar current={step} total={total} />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
