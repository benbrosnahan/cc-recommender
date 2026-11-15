'use client';

import { CreditTier } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';
import { StepFrame } from './QuizShell';

const OPTIONS: { value: CreditTier; label: string; description?: string }[] = [
  { value: 'none', label: 'I do not have one yet', description: 'This would be my first card' },
  { value: 'poor', label: 'Under 580', description: 'Limited history, or rebuilding' },
  { value: 'fair', label: '580 to 669', description: 'Fair' },
  { value: 'good', label: '670 to 739', description: 'Good' },
  { value: 'excellent', label: '740 or higher', description: 'Excellent' },
  { value: 'unknown', label: 'I would rather not say', description: 'We will include cards that need good credit' },
];

interface Props {
  value: CreditTier | null;
  onChange: (v: CreditTier) => void;
  onNext: () => void;
}

export function StepCreditScore({ value, onChange, onNext }: Props) {
  return (
    <StepFrame
      title="What is your credit score?"
      why="So we only show cards you have a real chance of being approved for. Not having a score is normal, and there are good cards built for it."
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
