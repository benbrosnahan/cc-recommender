'use client';

import { TravelIntent } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';
import { StepFrame } from './QuizShell';

const OPTIONS: { value: TravelIntent; label: string; description: string }[] = [
  { value: 'yes', label: 'Yes', description: 'Study abroad, family overseas, or trips out of the country' },
  { value: 'maybe', label: 'Maybe', description: 'Nothing planned, but it could happen' },
  { value: 'no', label: 'No', description: 'All of my spending is in the US' },
];

interface Props {
  value: TravelIntent | null;
  onChange: (v: TravelIntent) => void;
  onNext: () => void;
}

export function StepTravel({ value, onChange, onNext }: Props) {
  return (
    <StepFrame
      title="Will you spend money outside the US?"
      why="Some cards add a 3% fee to every purchase made abroad, which can wipe out the rewards."
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
