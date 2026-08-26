import { EarningsLine } from '@/types';
import { formatDollars } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  lines: EarningsLine[];
}

export function EarningsBreakdown({ lines }: Props) {
  if (lines.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-center justify-between gap-2 text-sm">
          <span
            className={cn(
              'text-slate-600 leading-snug',
              line.isDeduction && 'text-amber-700'
            )}
          >
            {line.label}
          </span>
          <span
            className={cn(
              'font-semibold tabular-nums shrink-0',
              line.isBonus && 'text-[#16A34A]',
              line.isDeduction && 'text-amber-700'
            )}
          >
            {line.isDeduction ? '-' : '+'}
            {formatDollars(Math.abs(line.annualAmount))}
          </span>
        </li>
      ))}
    </ul>
  );
}
