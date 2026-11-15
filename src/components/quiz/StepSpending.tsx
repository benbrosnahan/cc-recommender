'use client';

import { SpendingCategory } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';
import { StepFrame } from './QuizShell';

interface Option {
  value: SpendingCategory;
  label: string;
  description?: string;
}

const OPTIONS: Option[] = [
  {
    value: 'dining',
    label: 'Eating out and delivery',
    description: 'Restaurants, DoorDash, Uber Eats',
  },
  {
    value: 'groceries',
    label: 'Groceries',
    description: 'Supermarkets and food stores',
  },
  {
    value: 'coffee',
    label: 'Coffee shops',
    description: 'Starbucks, local cafés',
  },
  {
    value: 'online_shopping',
    label: 'Online shopping',
    description: 'Amazon, Target, general e-commerce',
  },
  {
    value: 'streaming',
    label: 'Streaming and subscriptions',
    description: 'Spotify, Netflix, Apple Music, YouTube',
  },
  {
    value: 'gas',
    label: 'Gas',
    description: 'Gas stations and fuel',
  },
  {
    value: 'transit',
    label: 'Transit and rideshare',
    description: 'Uber, Lyft, subway, bus',
  },
  {
    value: 'travel',
    label: 'Travel',
    description: 'Flights, hotels, international trips',
  },
  {
    value: 'even_split',
    label: 'It is pretty evenly split',
    description: 'No one category stands out',
  },
];

const MAX_SELECTIONS = 3;

interface Props {
  value: SpendingCategory[];
  onChange: (v: SpendingCategory[]) => void;
  onNext: () => void;
}

export function StepSpending({ value, onChange, onNext }: Props) {
  const isEvenSplit = value.includes('even_split');
  const picked = value.filter((v) => v !== 'even_split').length;

  function toggle(cat: SpendingCategory) {
    if (cat === 'even_split') {
      onChange(isEvenSplit ? [] : ['even_split']);
      return;
    }
    const without = value.filter((v) => v !== 'even_split');
    if (without.includes(cat)) {
      onChange(without.filter((v) => v !== cat));
    } else if (without.length < MAX_SELECTIONS) {
      onChange([...without, cat]);
    }
  }

  return (
    <StepFrame
      title="Where does most of your money go?"
      why="Pick up to three, biggest first. Cards pay different rates in different places, so this decides which one wins."
      action="Continue"
      canContinue={value.length > 0}
      onNext={onNext}
      groupRole="group"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          const isDisabled =
            opt.value !== 'even_split' && !isSelected && !isEvenSplit && picked >= MAX_SELECTIONS;
          return (
            <SelectionCard
              key={opt.value}
              role="checkbox"
              label={opt.label}
              description={opt.description}
              selected={isSelected}
              onClick={() => toggle(opt.value)}
              disabled={isDisabled}
            />
          );
        })}
      </div>
      <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-sm font-semibold text-slate-700">
        {picked >= MAX_SELECTIONS ? 'That is three. Unpick one to change it.' : ''}
      </p>
    </StepFrame>
  );
}
