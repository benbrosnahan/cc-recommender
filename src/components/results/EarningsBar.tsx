import { cn } from '@/lib/utils';

// The one chart in this tool. A card's first-year number is two different
// kinds of money: rewards on spending, which come back every year, and a
// welcome bonus or match, which is paid once. Drawing them as one bar in two
// fills shows how much of the headline survives into year two.
//
// Rules, so nobody "improves" them away later:
//   * Every bar on the page shares one scale (`scaleMax`), so lengths compare
//     across cards.
//   * The two fills differ by pattern as well as colour.
//   * The numbers are always printed next to the bar. Nothing depends on hover.

interface Props {
  later: number;
  extra: number;
  scaleMax: number;
  size?: 'lg' | 'sm';
  delay?: number;
  label: string;
}

export function EarningsBar({ later, extra, scaleMax, size = 'sm', delay = 0, label }: Props) {
  const max = Math.max(scaleMax, 1);
  const laterPct = (Math.max(later, 0) / max) * 100;
  const extraPct = (Math.max(extra, 0) / max) * 100;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'w-full overflow-hidden rounded-full bg-chart-track',
        size === 'lg' ? 'h-6' : 'h-3.5'
      )}
    >
      <div className="grow flex h-full gap-[2px]" style={{ animationDelay: `${delay}s` }}>
        {laterPct > 0 && (
          <span
            className={cn('h-full bg-chart-green', extraPct === 0 && 'rounded-r-full')}
            style={{ width: `${laterPct}%` }}
          />
        )}
        {extraPct > 0 && (
          <span className="hatch h-full rounded-r-full" style={{ width: `${extraPct}%` }} />
        )}
      </div>
    </div>
  );
}

export function LegendDot({ kind }: { kind: 'later' | 'extra' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-3 w-3 flex-shrink-0 rounded-[4px]',
        kind === 'later' ? 'bg-chart-green' : 'hatch'
      )}
    />
  );
}
