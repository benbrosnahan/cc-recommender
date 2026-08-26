'use client';

import { SpendingCategory } from '@/types';
import { SelectionCard } from '@/components/shared/SelectionCard';

interface Option {
  value: SpendingCategory;
  label: string;
  description?: string;
  icon: React.ReactNode;
}

const ICON_SIZE = 18;

const OPTIONS: Option[] = [
  {
    value: 'dining',
    label: 'Eating out / delivery',
    description: 'Restaurants, DoorDash, Uber Eats',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
      </svg>
    ),
  },
  {
    value: 'groceries',
    label: 'Groceries',
    description: 'Supermarkets and food stores',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      </svg>
    ),
  },
  {
    value: 'coffee',
    label: 'Coffee shops',
    description: 'Starbucks, local cafés',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    value: 'online_shopping',
    label: 'Online shopping',
    description: 'Amazon, Target, general e-commerce',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
  {
    value: 'streaming',
    label: 'Streaming & subscriptions',
    description: 'Spotify, Netflix, Apple Music, YouTube',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    value: 'gas',
    label: 'Gas & driving',
    description: 'Gas stations and fuel',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 22V8l9-6 9 6v14H3z" /><path d="M10 22V12h4v10" />
      </svg>
    ),
  },
  {
    value: 'transit',
    label: 'Transit & rideshare',
    description: 'Uber, Lyft, subway, bus',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21l4-4 4 4" /><path d="M12 17v4" />
      </svg>
    ),
  },
  {
    value: 'travel',
    label: 'Travel / study abroad',
    description: 'Flights, hotels, international trips',
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5 18 1 16 1 14.5 2.5L11 6 2.8 4.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 5.2 6.3c.4.4.9.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
  },
  {
    value: 'even_split',
    label: 'Pretty evenly split',
    description: "I don't have one clear top category",
    icon: (
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
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

  function toggle(cat: SpendingCategory) {
    if (cat === 'even_split') {
      onChange(['even_split']);
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
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Where does most of your money go?
      </h1>
      <p className="text-slate-500 mb-1.5 text-sm">
        Pick up to 3 categories.
      </p>
      {!isEvenSplit && value.length > 0 && (
        <p className="text-xs text-[#275B2D] font-medium mb-4">
          {value.length} of {MAX_SELECTIONS} selected
        </p>
      )}
      {(isEvenSplit || value.length === 0) && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
        {OPTIONS.map((opt) => {
          const isSelected = value.includes(opt.value);
          const isDisabled =
            opt.value !== 'even_split' &&
            !isSelected &&
            !isEvenSplit &&
            value.filter((v) => v !== 'even_split').length >= MAX_SELECTIONS;
          return (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              description={opt.description}
              icon={opt.icon}
              selected={isSelected}
              onClick={() => toggle(opt.value)}
              disabled={isDisabled}
            />
          );
        })}
      </div>
      <button
        onClick={onNext}
        disabled={value.length === 0}
        className="w-full py-3.5 bg-[#275B2D] text-white font-semibold rounded-xl hover:bg-[#1E4623] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
