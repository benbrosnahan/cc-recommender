import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  CardCalculation,
  CreditCard,
  CreditTier,
  QuizAnswers,
  RewardCategory,
  SpendBucket,
} from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDollars(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function spendBucketMonthlyMidpoint(bucket: SpendBucket): number {
  const map: Record<SpendBucket, number> = {
    under_500: 300,
    '500_1000': 750,
    '1000_2000': 1500,
    over_2000: 2500,
  };
  return map[bucket];
}

// ---- Plain-language labels for the results screen ----


function pct(rate: number): string {
  return `${parseFloat((rate * 100).toFixed(2))}%`;
}

// Rates that only apply inside a bank's travel portal or on one airline's own
// tickets. Real, but not what a student earns day to day, so they never count
// as a card's headline rate.
const NOT_EVERYDAY: RewardCategory[] = [
  'capital_one_travel',
  'bofa_travel_portal',
  'united_purchases',
  'delta_purchases',
  'citi_top_category',
];

const CATEGORY_WORD: Partial<Record<RewardCategory, string>> = {
  dining: 'dining',
  groceries: 'groceries',
  coffee: 'coffee',
  online_shopping: 'online shopping',
  streaming: 'streaming',
  gas: 'gas',
  transit: 'transit',
  travel: 'travel',
};

function list(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/** The best rate a student would actually see on ordinary purchases. */
export function bestEverydayRate(card: CreditCard): string {
  if (card.id === 'citi-custom-cash') return '5% on your top category';
  if (card.rotating) return `${pct(card.rotating.rate)} in rotating categories`;
  const miles = card.welcomeBonus?.isMiles === true;
  const unit = (rate: number) =>
    miles ? `${parseFloat((rate * 100).toFixed(2))} miles per dollar` : pct(rate);
  const everyday = card.rewardRates.filter((r) => !NOT_EVERYDAY.includes(r.category));
  const max = everyday.reduce((m, r) => Math.max(m, r.rate), card.baseRate);
  if (max === 0) return 'No rewards';
  if (everyday.length === 0 || max <= card.baseRate) return `${unit(card.baseRate)} on everything`;
  const top = everyday.filter((r) => r.rate === max);
  if (top.some((r) => r.isChoice)) return `${unit(max)} in a category you pick`;
  const words = top.map((r) => CATEGORY_WORD[r.category]).filter((w): w is string => !!w);
  return `${unit(max)} on ${list(words.slice(0, 3))}`;
}

/**
 * Banks do not publish a minimum score, so this is the band the card is
 * usually approved in, on the same bands the quiz asks about.
 */
export function creditNeeded(card: CreditCard): string {
  const map: Record<CreditTier, string> = {
    none: 'No score needed',
    poor: 'Limited history OK',
    fair: 'Fair, about 580+',
    good: 'Good, about 670+',
    excellent: 'Excellent, about 740+',
    unknown: 'Varies',
  };
  return map[card.minCreditTier];
}

/**
 * Whole-dollar figures for display. Year one is the sum of the two rounded
 * parts, so the headline always equals what the bar and the legend show.
 */
export function figures(calc: CardCalculation) {
  const later = Math.round(calc.everyYearValue);
  const extra = Math.round(calc.firstYearOnlyValue);
  return { later, extra, yearOne: later + extra };
}

/** What to call a card's first-year-only money, given what it actually earned. */
export function firstYearExtraName(calc: CardCalculation): string {
  const { card } = calc;
  if (card.welcomeBonus?.isCashbackMatch) return 'Cashback Match';
  const rateBonus = calc.firstYearOnlyValue - calc.welcomeBonusValue > 0.005;
  if (rateBonus) return calc.welcomeBonusValue > 0 ? 'welcome and first-year rate bonuses' : 'first-year rate bonus';
  if (card.welcomeBonus?.earnedBy) return 'autopay credit';
  return 'welcome bonus';
}

/** True when the card pays one rate on ordinary purchases, with no categories. */
export function isFlatRate(card: CreditCard): boolean {
  if (card.id === 'citi-custom-cash' || card.rotating) return false;
  return card.rewardRates.filter((r) => !NOT_EVERYDAY.includes(r.category)).every((r) => r.rate <= card.baseRate);
}

/** The quiz answers, said back in a few words each. */
export function answerSummary(a: QuizAnswers): string[] {
  const out: string[] = [];
  const tier: Record<CreditTier, string> = {
    none: 'No credit history yet',
    poor: 'Score under 580',
    fair: 'Score 580 to 669',
    good: 'Score 670 to 739',
    excellent: 'Score 740 or higher',
    unknown: 'Score not shared',
  };
  if (a.creditTier) out.push(tier[a.creditTier]);
  if (a.spendBucket) out.push(`About ${formatDollars(spendBucketMonthlyMidpoint(a.spendBucket))} a month`);
  const cats = a.spendingCategories;
  if (cats.includes('even_split') || cats.length === 0) out.push('Spending spread evenly');
  else out.push(`Mostly ${list(cats.map((c) => (c === 'dining' ? 'eating out' : CATEGORY_WORD[c] ?? c)))}`);
  if (a.travelIntent === 'yes') out.push('Travels abroad');
  if (a.travelIntent === 'maybe') out.push('Might travel abroad');
  if (a.travelIntent === 'no') out.push('Stays in the US');
  const want = {
    maximize_cash: 'Wants the most cash back',
    simplicity: 'Wants it simple',
    credit_building: 'Wants to build credit',
    travel_rewards: 'Wants travel rewards',
  };
  if (a.priority) out.push(want[a.priority]);
  return out;
}
