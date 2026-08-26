import { CardCalculation } from '@/types';
import { formatDollars } from '@/lib/utils';

interface Props {
  top3: CardCalculation[];
}

function fee(calc: CardCalculation) {
  return calc.card.foreignTransactionFee > 0 ? '3%' : 'None';
}

function creditReq(calc: CardCalculation) {
  const map: Record<string, string> = {
    none: 'No history needed',
    poor: '580+',
    fair: '580–669',
    good: '670+',
    excellent: '700+',
    unknown: 'Varies',
  };
  return map[calc.card.minCreditTier] ?? '—';
}

function topRate(calc: CardCalculation) {
  const rates = calc.card.rewardRates;
  if (calc.card.id === 'citi-custom-cash') return '5% (top category)';
  if (calc.card.welcomeBonus?.isCashbackMatch) {
    const base = rates[0]?.rate ?? calc.card.baseRate;
    return `${(base * 100).toFixed(0)}% + Cashback Match`;
  }
  const max = rates.reduce((m, r) => Math.max(m, r.rate), calc.card.baseRate);
  if (max === calc.card.baseRate) return `${(max * 100).toFixed(1).replace('.0', '')}% flat`;
  return `${(max * 100).toFixed(0)}% (cat.) / ${(calc.card.baseRate * 100).toFixed(1).replace('.0', '')}% base`;
}

function bonus(calc: CardCalculation) {
  if (!calc.card.welcomeBonus) return 'None';
  if (calc.card.welcomeBonus.isCashbackMatch) return 'Cashback Match (2× year 1)';
  return calc.card.welcomeBonus.isTravelCredit
    ? `$${calc.card.welcomeBonus.amount} travel credit`
    : `$${calc.card.welcomeBonus.amount}`;
}

const ROWS = [
  { label: 'Year One Value', fn: (c: CardCalculation) => formatDollars(c.yearOneValue), highlight: true },
  { label: 'Welcome Bonus', fn: bonus },
  { label: 'Top Reward Rate', fn: topRate },
  { label: 'Foreign Fee', fn: fee },
  { label: 'Credit Required', fn: creditReq },
  { label: 'Annual Fee', fn: () => '$0' },
];

export function ComparisonTable({ top3 }: Props) {
  return (
    <div className="mt-8">
      <h3 className="text-base font-bold text-slate-800 mb-3">Side-by-side comparison</h3>
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider w-36 sticky left-0 bg-slate-50 border-r border-slate-200">
                Feature
              </th>
              {top3.map((c, i) => (
                <th key={c.card.id} className="px-4 py-3 text-left font-semibold text-slate-800 text-xs">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mr-1.5 ${i === 0 ? 'bg-[#275B2D] text-white' : i === 1 ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {i === 0 ? 'Top Pick' : i === 1 ? 'Runner-up' : '#3'}
                  </span>
                  <br />
                  {c.card.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={ri} className={row.highlight ? 'bg-green-50' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="px-4 py-3 font-medium text-slate-600 text-xs sticky left-0 bg-inherit border-r border-slate-200 whitespace-nowrap">
                  {row.label}
                </td>
                {top3.map((c) => (
                  <td
                    key={c.card.id}
                    className={`px-4 py-3 ${row.highlight ? 'font-black text-[#16A34A] text-base' : 'text-slate-700 font-medium text-sm'}`}
                  >
                    {row.fn(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
