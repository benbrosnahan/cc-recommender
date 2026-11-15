'use client';

import { Priority } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';
import { StepFrame } from './QuizShell';

const OPTIONS: { value: Priority; label: string; description: string }[] = [
  { value: 'maximize_cash', label: 'The most money back', description: 'I will track categories if it pays more' },
  { value: 'simplicity', label: 'Keeping it simple', description: 'One rate on everything, nothing to remember' },
  { value: 'credit_building', label: 'Building my credit', description: 'A card made for a first credit history' },
  { value: 'travel_rewards', label: 'Travel', description: 'Rewards I can put toward flights and trips' },
];

interface Props {
  value: Priority | null;
  onChange: (v: Priority) => void;
  onNext: () => void;
}

export function StepPriority({ value, onChange, onNext }: Props) {
  return (
    <StepFrame
      title="What matters most to you?"
      why="When two cards come out close in dollars, this decides which one we put first."
      action="Show my three cards"
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
