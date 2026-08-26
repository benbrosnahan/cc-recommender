'use client';

import { CreditTier } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';

interface Option {
  value: CreditTier;
  label: string;
  description?: string;
}

const OPTIONS: Option[] = [
  {
    value: 'none',
    label: "I don't have a credit score yet",
    description: 'No credit history — just getting started',
  },
  {
    value: 'poor',
    label: 'Under 580',
    description: 'Limited or rebuilding credit',
  },
  {
    value: 'fair',
    label: '580–669',
    description: 'Fair credit — building history',
  },
  {
    value: 'good',
    label: '670–739',
    description: 'Good credit — solid track record',
  },
  {
    value: 'excellent',
    label: '740 and above',
    description: 'Very good or excellent credit',
  },
  {
    value: 'unknown',
    label: "Prefer not to answer",
    description: "We'll show you a broad range of options",
  },
];

interface Props {
  value: CreditTier | null;
  onChange: (v: CreditTier) => void;
  onNext: () => void;
}

export function StepCreditScore({ value, onChange, onNext }: Props) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        What&apos;s your credit score?
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        This helps us surface cards you&apos;re likely to get approved for.
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
