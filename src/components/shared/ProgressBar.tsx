import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
}

// Five questions, five segments. A percentage would add nothing to "2 of 5".
export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Question ${current} of ${total}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
        Question {current} of {total}
      </p>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i < current ? 'bg-navy' : 'bg-slate-200'
            )}
          />
        ))}
      </div>
    </div>
  );
}
