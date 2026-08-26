import { CreditCard } from '@/types';

const ISSUER_COLORS: Record<string, string> = {
  Discover: 'bg-orange-100 text-orange-800',
  'Capital One': 'bg-red-100 text-red-800',
  Chase: 'bg-blue-100 text-blue-800',
  'Bank of America': 'bg-red-100 text-red-900',
  Citi: 'bg-sky-100 text-sky-800',
  'American Express': 'bg-emerald-100 text-emerald-800',
};

interface Props {
  card: CreditCard;
}

function topRateLine(card: CreditCard): string {
  if (card.id === 'citi-custom-cash') return '5% on your top category (auto)';
  if (card.welcomeBonus?.isCashbackMatch) {
    const r = card.rewardRates[0];
    const base = r ? `${(r.rate * 100).toFixed(0)}%` : `${(card.baseRate * 100).toFixed(0)}%`;
    return `${base}+ with Cashback Match`;
  }
  const max = card.rewardRates.reduce((m, r) => Math.max(m, r.rate), card.baseRate);
  if (max === card.baseRate) return `${(max * 100).toFixed(1).replace('.0', '')}% flat on everything`;
  return `Up to ${(max * 100).toFixed(0)}% on top categories`;
}

function bonusLine(card: CreditCard): string {
  if (!card.welcomeBonus) return 'No welcome bonus';
  if (card.welcomeBonus.isCashbackMatch) return 'Cashback Match — all year-1 earnings doubled';
  const amt = `$${card.welcomeBonus.amount}`;
  const req = card.welcomeBonus.spendRequirement > 0
    ? ` after $${card.welcomeBonus.spendRequirement.toLocaleString()} in ${card.welcomeBonus.timeframeMonths} months`
    : '';
  return `${amt}${req}`;
}

export function UniverseCard({ card }: Props) {
  return (
    <div
      className={`bg-white rounded-2xl border p-5 ${card.isExcluded ? 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'} transition-all`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ISSUER_COLORS[card.issuer] ?? 'bg-slate-100 text-slate-700'}`}
        >
          {card.issuer}
        </span>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {card.isStudentCard && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EAF3E7] text-[#275B2D] rounded-full uppercase tracking-wide">
              Student Card
            </span>
          )}
          {card.airlineCard && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full uppercase tracking-wide">
              Airline
            </span>
          )}
          {card.isExcluded && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wide">
              Not recommended
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-sm leading-snug mb-0.5">{card.name}</h3>
      <p className="text-xs text-slate-500 mb-3">{card.tagline}</p>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 w-20 shrink-0">Top rate</span>
          <span className="font-semibold text-slate-700">{topRateLine(card)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 w-20 shrink-0">Bonus</span>
          <span className="font-semibold text-slate-700">{bonusLine(card)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 w-20 shrink-0">Foreign fee</span>
          <span className={`font-semibold ${card.foreignTransactionFee === 0 ? 'text-[#16A34A]' : 'text-amber-700'}`}>
            {card.foreignTransactionFee === 0 ? 'None' : '3%'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 w-20 shrink-0">Annual fee</span>
          <span className="font-semibold text-[#16A34A]">$0</span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">Why we consider it: </span>
          {card.universeReasoning}
        </p>
        {card.universeExclusions && (
          <p className="text-xs text-amber-700 leading-relaxed mt-2">
            <span className="font-semibold">Why it&apos;s excluded from recommendations: </span>
            {card.universeExclusions}
          </p>
        )}
      </div>
    </div>
  );
}
