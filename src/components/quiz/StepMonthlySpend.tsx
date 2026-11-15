'use client';

import { SpendBucket } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';
import { StepFrame } from './QuizShell';

const OPTIONS: { value: SpendBucket; label: string; description: string }[] = [
  { value: 'under_500', label: 'Under $500', description: 'Food, a few subscriptions, the odd night out' },
  { value: '500_1000', label: '$500 to $1,000', description: 'Groceries, eating out, getting around' },
  { value: '1000_2000', label: '$1,000 to $2,000', description: 'Most living costs go on the card' },
  { value: 'over_2000', label: 'Over $2,000', description: 'Travel or big bills go on the card too' },
];

interface Props {
  value: SpendBucket | null;
  onChange: (v: SpendBucket) => void;
  onNext: () => void;
}

export function StepMonthlySpend({ value, onChange, onNext }: Props) {
  return (
    <StepFrame
      title="About how much would you put on a card each month?"
      why="A guess is fine. This is what turns reward percentages into dollars. Count only what you could pay off in full."
      action="Continue"
      canContinue={!!value}
      onNext={onNext}
    >
      <div className="flex flex-col gap-2.5">
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
    </StepFrame>
  );
}
