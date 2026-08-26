'use client';

import { TravelIntent } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';

const OPTIONS: { value: TravelIntent; label: string; description: string }[] = [
  {
    value: 'yes',
    label: 'Yes — I study abroad or travel internationally',
    description: "Foreign transaction fees matter to me",
  },
  {
    value: 'maybe',
    label: "Maybe — it's possible in the future",
    description: "I'd like to keep my options open",
  },
  {
    value: 'no',
    label: 'No — all my spending is US-based',
    description: "I won't be traveling internationally",
  },
];

interface Props {
  value: TravelIntent | null;
  onChange: (v: TravelIntent) => void;
  onNext: () => void;
}

export function StepTravel({ value, onChange, onNext }: Props) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Do you travel internationally?
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        Some cards charge a 3% fee on purchases abroad — this affects your real earnings.
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
