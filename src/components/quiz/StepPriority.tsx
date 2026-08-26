'use client';

import { Priority } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';

const OPTIONS: { value: Priority; label: string; description: string }[] = [
  {
    value: 'maximize_cash',
    label: 'Maximize cash back',
    description: "I want the highest possible dollar return on my spending",
  },
  {
    value: 'simplicity',
    label: 'Keep it simple',
    description: "No category tracking — just a card I can swipe anywhere",
  },
  {
    value: 'credit_building',
    label: 'Build my credit score',
    description: "I want a card designed to grow my credit history",
  },
  {
    value: 'travel_rewards',
    label: 'Travel perks & miles',
    description: "I want rewards I can use toward flights, hotels, or future trips",
  },
];

interface Props {
  value: Priority | null;
  onChange: (v: Priority) => void;
  onNext: () => void;
}

export function StepPriority({ value, onChange, onNext }: Props) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        What matters most to you?
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        When cards are close in value, this tiebreaker shapes your final picks.
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
        See my cards
      </button>
    </div>
  );
}
