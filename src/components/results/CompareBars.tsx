import { CardCalculation } from '@/types';
import { figures, formatDollars } from '@/lib/utils';
import { Card, Eyebrow } from '@/components/shared/ui';
import { EarningsBar, LegendDot } from './EarningsBar';

interface Props {
  top3: CardCalculation[];
  scaleMax: number;
}

/** Short enough to sit beside a bar. Drops the bank's legal marks. */
function shortName(name: string): string {
  return name.replace(/[®℠™]/g, '').replace(/\s+/g, ' ').trim();
}

export function CompareBars({ top3, scaleMax }: Props) {
  const rows = top3.map((calc) => ({ calc, ...figures(calc) }));
  const pick = rows[0];
  // A lower-ranked card can still pay more once the first-year extras end.
  const laterWinner = rows.slice(1).sort((a, b) => b.later - a.later)[0];
  const overtakes = laterWinner && laterWinner.later > pick.later;
  const ties = laterWinner && laterWinner.later === pick.later && pick.extra > laterWinner.extra;

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-2xl font-bold leading-tight text-slate-900">
        All three, on one scale
      </h2>
      <p className="mt-1.5 text-base leading-relaxed text-slate-700">
        The solid part comes back every year. The striped part is paid once.
      </p>

      <ol className="mt-5 space-y-5">
        {rows.map(({ calc, later, extra, yearOne }, i) => (
          <li key={calc.card.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <p className="text-base font-semibold leading-snug text-slate-900">{shortName(calc.card.name)}</p>
              <p className="tnum text-sm text-slate-700">
                <span className="font-bold text-slate-900">{formatDollars(yearOne)}</span> in year one, then{' '}
                <span className="font-bold text-slate-900">{formatDollars(later)}</span> a year
              </p>
            </div>
            <div className="mt-2">
              <EarningsBar
                later={later}
                extra={extra}
                scaleMax={scaleMax}
                delay={0.2 + i * 0.08}
                label={`${shortName(calc.card.name)}: ${formatDollars(yearOne)} in year one, then ${formatDollars(later)} a year`}
              />
            </div>
          </li>
        ))}
      </ol>

      <ul className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4 text-sm text-slate-800 sm:flex-row sm:gap-x-5">
        <li className="flex items-center gap-2">
          <LegendDot kind="later" /> Rewards on your spending, every year
        </li>
        <li className="flex items-center gap-2">
          <LegendDot kind="extra" /> Welcome bonus or match, first year only
        </li>
      </ul>

      {overtakes && (
        <div className="mt-4 rounded-2xl bg-brand-light p-4">
          <Eyebrow>Look past year one</Eyebrow>
          <p className="mt-1 text-base leading-relaxed text-slate-800">
            {shortName(laterWinner.calc.card.name)} keeps paying{' '}
            <span className="tnum font-semibold">{formatDollars(laterWinner.later)}</span> a year, against{' '}
            <span className="tnum font-semibold">{formatDollars(pick.later)}</span> for the top pick
            {pick.extra > 0 ? ' once its first-year extra ends' : ''}. If you expect to keep one card for years, it
            may be the better choice.
          </p>
        </div>
      )}

      {ties && (
        <div className="mt-4 rounded-2xl bg-brand-light p-4">
          <Eyebrow>Look past year one</Eyebrow>
          <p className="mt-1 text-base leading-relaxed text-slate-800">
            Once the first-year extras end, {shortName(laterWinner.calc.card.name)} pays the same{' '}
            <span className="tnum font-semibold">{formatDollars(pick.later)}</span> a year as the top pick. The
            top pick is ahead only because of its bigger first year.
          </p>
        </div>
      )}
    </Card>
  );
}
