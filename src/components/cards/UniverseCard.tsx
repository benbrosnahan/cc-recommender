import { CreditCard } from '@/types';
import { bestEverydayRate, cn, creditNeeded } from '@/lib/utils';
import { Badge, Card } from '@/components/shared/ui';

interface Props {
  card: CreditCard;
}

function bonusLine(card: CreditCard): string {
  const b = card.welcomeBonus;
  if (!b) return 'None';
  if (b.isCashbackMatch) return 'Everything you earn in year one, doubled';
  const amount = b.isMiles ? `${(b.amount * 100).toLocaleString()} miles` : `$${b.amount}`;
  const rateBonus = card.rewardRates.some((r) => r.firstYearBonusRate)
    ? ', plus an extra 3% in your chosen category'
    : '';
  if (b.earnedBy) return `${amount} for ${b.earnedBy}`;
  if (b.spendRequirement === 0) return amount;
  return `${amount} after $${b.spendRequirement.toLocaleString()} in ${b.timeframeMonths} months${rateBonus}`;
}

export function UniverseCard({ card }: Props) {
  const rows = [
    ['Best everyday rate', bestEverydayRate(card)],
    ['First-year extra', bonusLine(card)],
    ['Fee abroad', card.foreignTransactionFee === 0 ? 'None' : '3% per purchase'],
    ['Credit score needed', creditNeeded(card)],
  ];
  return (
    <Card className={cn('flex flex-col p-5', card.isExcluded && 'bg-white/60 shadow-none')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-600">{card.issuer}</span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {card.isStudentCard && <Badge>Student card</Badge>}
          {card.airlineCard && <Badge>Airline</Badge>}
          {card.isExcluded && <Badge tone="accent">Left out</Badge>}
        </div>
      </div>

      <h3 className="mt-2 font-display text-xl font-bold leading-tight text-slate-900">{card.name}</h3>
      <p className="mt-1 text-sm leading-snug text-slate-700">{card.tagline}</p>

      {/* Cards we do not recommend get the reasoning only. Their offer terms
          are not re-checked, so they are not printed as facts. */}
      {!card.isExcluded && (
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-36 flex-shrink-0 text-slate-600">{k}</dt>
              <dd className="font-semibold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="mt-4 text-sm leading-relaxed text-slate-700">
        <span className="font-bold text-slate-900">Why it is here. </span>
        {card.universeReasoning}
      </p>
      {card.universeExclusions && (
        <p className="mt-3 rounded-2xl bg-accent-light/60 p-3.5 text-sm leading-relaxed text-accent-deep">
          <span className="font-bold">Why we left it out. </span>
          {card.universeExclusions}
        </p>
      )}
    </Card>
  );
}
