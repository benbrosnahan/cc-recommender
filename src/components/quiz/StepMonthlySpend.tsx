'use client';

import { SpendBucket } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';

const OPTIONS: { value: SpendBucket; label: string; description: string }[] = [
  {
    value: 'under_500',
    label: 'Under $500 / month',
    description: 'Light spending — a typical low-budget semester',
  },
  {
    value: '500_1000',
    label: '$500–$1,000 / month',
    description: 'Moderate spending — dining out, subscriptions, essentials',
  },
  {
    value: '1000_2000',
    label: '$1,000–$2,000 / month',
    description: 'Active spending — rent split, groceries, going out',
  },
  {
    value: 'over_2000',
    label: 'Over $2,000 / month',
    description: 'High spending — rent, travel, living expenses',
  },
];

interface Props {
  value: SpendBucket | null;
  onChange: (v: SpendBucket) => void;
  onNext: () => void;
}

export function StepMonthlySpend({ value, onChange, onNext }: Props) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        How much do you spend each month?
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        An estimate is fine — we use this to calculate your real-dollar rewards.
      </p>
      <div className="flex flex-col gap-2.5 mb-8">
        {OPTIONS.map((opt) => (
          <SelectionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!value}
        className="w-full py-3.5 bg-[#275B2D] text-white font-semibold rounded-xl hover:bg-[#1E4623] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
