import {
  QuizAnswers,
  CreditCard,
  CreditTier,
  SpendBucket,
  SpendingCategory,
  CardCalculation,
  EarningsLine,
  RecommendationResult,
  RewardRate,
} from '@/types';
import { ACTIVE_CARDS } from '@/data/cards';

const SPEND_MIDPOINTS: Record<SpendBucket, number> = {
  under_500: 300,
  '500_1000': 750,
  '1000_2000': 1500,
  over_2000: 2500,
};

const TIER_ORDER: CreditTier[] = ['none', 'poor', 'fair', 'good', 'excellent'];

function tierLevel(tier: CreditTier): number {
  if (tier === 'unknown') return TIER_ORDER.indexOf('good');
  return TIER_ORDER.indexOf(tier);
}

function isEligible(card: CreditCard, userTier: CreditTier): boolean {
  return tierLevel(userTier) >= tierLevel(card.minCreditTier);
}

function ineligibilityReason(card: CreditCard): string {
  const map: Record<CreditTier, string> = {
    none: 'Requires established credit history',
    poor: 'Typically requires a credit score of 580+',
    fair: 'Typically requires a credit score of 620+',
    good: 'Typically requires a credit score of 670+',
    excellent: 'Typically requires a credit score of 700+',
    unknown: '',
  };
  return map[card.minCreditTier] ?? 'Credit requirements not met';
}

interface CategoryAllocation {
  category: SpendingCategory | 'base';
  annualDollars: number;
}

function allocateSpend(
  categories: SpendingCategory[],
  annualSpend: number
): CategoryAllocation[] {
  if (categories.length === 0 || categories.includes('even_split')) {
    const evenCats: SpendingCategory[] = ['dining', 'groceries', 'gas', 'online_shopping', 'streaming', 'transit'];
    const perCat = annualSpend / evenCats.length;
    return evenCats.map((c) => ({ category: c, annualDollars: perCat }));
  }

  const allocations: [number, number, number, number] = [0.4, 0.3, 0.2, 0.1];
  const result: CategoryAllocation[] = [];

  if (categories.length === 1) {
    result.push({ category: categories[0], annualDollars: annualSpend * 0.8 });
    result.push({ category: 'base', annualDollars: annualSpend * 0.2 });
  } else if (categories.length === 2) {
    result.push({ category: categories[0], annualDollars: annualSpend * 0.45 });
    result.push({ category: categories[1], annualDollars: annualSpend * 0.35 });
    result.push({ category: 'base', annualDollars: annualSpend * 0.2 });
  } else {
    result.push({ category: categories[0], annualDollars: annualSpend * allocations[0] });
    result.push({ category: categories[1], annualDollars: annualSpend * allocations[1] });
    result.push({ category: categories[2], annualDollars: annualSpend * allocations[2] });
    result.push({ category: 'base', annualDollars: annualSpend * allocations[3] });
  }

  return result;
}

// Every issuer here codes coffee shops as restaurants (Discover's terms name
// cafes), so coffee earns whatever the card pays on dining.
function earnsAs(category: SpendingCategory | 'base'): SpendingCategory | 'base' {
  return category === 'coffee' ? 'dining' : category;
}

function rateCovers(rate: RewardRate, category: SpendingCategory | 'base'): boolean {
  if (category === 'base') return false;
  return (rate.covers ?? [rate.category]).includes(category as never);
}

/**
 * Takes up to `cap` dollars from the listed allocations' remaining spend, pro
 * rata, since spending in the categories under one cap is interleaved through
 * the quarter. Returns the dollars taken from each allocation.
 */
function takeProRata(remaining: number[], indexes: number[], cap: number): Map<number, number> {
  const taken = new Map<number, number>();
  const eligible = indexes.reduce((sum, i) => sum + remaining[i], 0);
  if (eligible <= 0) return taken;
  const scale = Math.min(1, cap / eligible);
  for (const i of indexes) {
    const t = remaining[i] * scale;
    if (t > 0) {
      taken.set(i, t);
      remaining[i] -= t;
    }
  }
  return taken;
}

interface CardEarnings {
  // Paid every year, per allocation, in the allocations' order
  perAllocation: number[];
  // Paid in year one only, on top: a first-year rate boost
  firstYearExtra: number;
}

/**
 * A year of rewards, one quarter at a time, with spending spread evenly across
 * the quarters. Order of tiers in a quarter: the rotating 5% up to its cap,
 * then capped rates up to the card's combined cap, then uncapped rates, then
 * the base rate on whatever is left.
 */
function earningsForCard(card: CreditCard, allocations: CategoryAllocation[]): CardEarnings {
  const perAllocation = allocations.map(() => 0);
  let firstYearExtra = 0;
  const cats = allocations.map((a) => earnsAs(a.category));
  const every = allocations.map((_, i) => i);

  // Choice cards (BofA Customized Cash): assume the cardholder picks the
  // option that covers the most of their spending. Ties go to the first listed.
  const choices = card.rewardRates.filter((r) => r.isChoice);
  let chosen: RewardRate | null = null;
  let chosenDollars = -1;
  for (const r of choices) {
    const dollars = allocations.reduce((sum, a, i) => sum + (rateCovers(r, cats[i]) ? a.annualDollars : 0), 0);
    if (dollars > chosenDollars) {
      chosen = r;
      chosenDollars = dollars;
    }
  }
  const rateFor = (i: number): RewardRate | undefined =>
    card.rewardRates.find((r) => rateCovers(r, cats[i]) && (!r.isChoice || r === chosen));

  for (let q = 0; q < 4; q++) {
    const remaining = allocations.map((a) => a.annualDollars / 4);

    if (card.rotating) {
      const active = card.rotating.quarters[q];
      const idx = every.filter((i) => cats[i] !== 'base' && active.includes(cats[i] as SpendingCategory));
      for (const [i, t] of takeProRata(remaining, idx, card.rotating.quarterlyCap)) {
        perAllocation[i] += t * card.rotating.rate;
      }
    }

    const capped = every.filter((i) => rateFor(i)?.quarterlyCap);
    if (capped.length > 0) {
      const cap = rateFor(capped[0])!.quarterlyCap!;
      for (const [i, t] of takeProRata(remaining, capped, cap)) {
        const r = rateFor(i)!;
        perAllocation[i] += t * r.rate;
        firstYearExtra += t * (r.firstYearBonusRate ?? 0);
      }
    }

    for (let i = 0; i < allocations.length; i++) {
      const r = rateFor(i);
      if (r && !r.quarterlyCap) {
        perAllocation[i] += remaining[i] * r.rate;
        remaining[i] = 0;
      }
      perAllocation[i] += remaining[i] * card.baseRate;
    }
  }
  return { perAllocation, firstYearExtra };
}

function calculateCard(
  card: CreditCard,
  answers: QuizAnswers,
  annualSpend: number,
  monthlySpend: number,
  allocations: CategoryAllocation[]
): CardCalculation {
  const userTier = answers.creditTier ?? 'none';
  const eligible = isEligible(card, userTier);

  const breakdown: EarningsLine[] = [];
  let categoryEarnings = 0;
  let firstYearRateBonus = 0;

  if (eligible) {
    const { perAllocation, firstYearExtra } = earningsForCard(card, allocations);
    allocations.forEach((alloc, i) => {
      const earned = perAllocation[i];
      if (earned <= 0) return;
      const label = alloc.category === 'base' ? 'Everything else' : categoryLabel(alloc.category);
      breakdown.push({ label, annualAmount: earned });
      categoryEarnings += earned;
    });
    firstYearRateBonus = firstYearExtra;
  }

  // A higher rate that only lasts a year is first-year money, like a match
  if (firstYearRateBonus > 0) {
    breakdown.push({
      label: 'Extra 3% on your chosen category (first year only)',
      annualAmount: firstYearRateBonus,
      isBonus: true,
    });
  }

  // Cashback Match (Discover): double all year-1 earnings
  let cashbackMatchBonus = 0;
  if (eligible && card.welcomeBonus?.isCashbackMatch) {
    cashbackMatchBonus = categoryEarnings;
    breakdown.push({
      label: 'Cashback Match (first year only)',
      annualAmount: cashbackMatchBonus,
      isBonus: true,
    });
  }

  // Welcome bonus
  let welcomeBonusValue = 0;
  let didQualifyForBonus = false;
  if (eligible && card.welcomeBonus && !card.welcomeBonus.isCashbackMatch) {
    const spendWindow = card.welcomeBonus.timeframeMonths;
    const windowSpend = monthlySpend * spendWindow;
    if (windowSpend >= card.welcomeBonus.spendRequirement) {
      welcomeBonusValue = card.welcomeBonus.amount;
      didQualifyForBonus = true;
      const bonusLabel = card.welcomeBonus.isTravelCredit
        ? 'Welcome bonus, as travel credit (first year only)'
        : card.welcomeBonus.isMiles
        ? 'Welcome bonus, in miles at 1¢ each (first year only)'
        : card.welcomeBonus.earnedBy
        ? 'Credit for setting up autopay (first year only)'
        : 'Welcome bonus (first year only)';
      breakdown.push({ label: bonusLabel, annualAmount: welcomeBonusValue, isBonus: true });
    }
  }

  // Perks
  let perksValue = 0;
  for (const perk of card.perks) {
    perksValue += perk.annualDollarValue;
    breakdown.push({
      label: `${perk.label}${perk.condition ? ` (${perk.condition})` : ''}`,
      annualAmount: perk.annualDollarValue,
      isBonus: true,
    });
  }

  // Foreign transaction fee impact
  let foreignFeeImpact = 0;
  if (eligible && card.foreignTransactionFee > 0 && answers.travelIntent === 'yes') {
    foreignFeeImpact = annualSpend * 0.2 * card.foreignTransactionFee;
    breakdown.push({
      label: 'Foreign transaction fees (est.)',
      annualAmount: -foreignFeeImpact,
      isDeduction: true,
    });
  }

  // Split the headline in two. A match or a welcome bonus is paid once, so a
  // card that looks best in year one can fall behind from year two on.
  const everyYearValue = eligible ? categoryEarnings + perksValue - foreignFeeImpact : 0;
  const firstYearOnlyValue = eligible ? cashbackMatchBonus + welcomeBonusValue + firstYearRateBonus : 0;
  // Year one is added up in one pass, in a fixed order. Adding the two parts
  // above instead gives the same dollars but can differ in the last binary
  // digit, which is enough to reorder two cards that tie exactly.
  const yearOneValue = eligible
    ? categoryEarnings + cashbackMatchBonus + welcomeBonusValue + perksValue - foreignFeeImpact + firstYearRateBonus
    : 0;

  return {
    card,
    yearOneValue,
    everyYearValue,
    firstYearOnlyValue,
    earningsBreakdown: breakdown,
    welcomeBonusValue,
    perksValue,
    foreignFeeImpact,
    isEligible: eligible,
    ineligibilityReason: eligible ? undefined : ineligibilityReason(card),
    didQualifyForBonus,
    monthlySpendUsed: monthlySpend,
    annualSpendUsed: annualSpend,
  };
}

function categoryLabel(cat: SpendingCategory | string): string {
  const map: Record<string, string> = {
    dining: 'Dining & delivery',
    groceries: 'Groceries',
    coffee: 'Coffee shops',
    online_shopping: 'Online shopping',
    streaming: 'Streaming services',
    gas: 'Gas & fuel',
    transit: 'Transit & rideshare',
    travel: 'Travel',
    even_split: 'All purchases',
  };
  return map[cat] ?? cat;
}

function priorityBoost(
  calc: CardCalculation,
  priority: QuizAnswers['priority'],
  maxValue: number
): number {
  const card = calc.card;
  const withinRange = calc.yearOneValue >= maxValue * 0.7;

  if (priority === 'travel_rewards') {
    if (card.foreignTransactionFee === 0 && card.transferablePoints) return 200;
    if (card.foreignTransactionFee === 0 && card.airlineCard) return 150;
    if (card.foreignTransactionFee === 0) return 100;
    return 0;
  }
  if (priority === 'simplicity') {
    const isFlat = !card.rotating && card.rewardRates.length <= 1;
    if (isFlat && withinRange) return 80;
    if (card.rotating) return -50;
    return 0;
  }
  if (priority === 'credit_building') {
    if (card.isStudentCard && card.minCreditTier === 'none') return 120;
    if (card.id === 'freedom-rise') return 80;
    return 0;
  }
  return 0;
}

export function calculateRecommendations(answers: QuizAnswers): RecommendationResult {
  const spendBucket = answers.spendBucket ?? 'under_500';
  const monthlySpend = SPEND_MIDPOINTS[spendBucket];
  const annualSpend = monthlySpend * 12;
  const categories = answers.spendingCategories;

  const allocations = allocateSpend(categories, annualSpend);

  const allCalculations = ACTIVE_CARDS.map((card) =>
    calculateCard(card, answers, annualSpend, monthlySpend, allocations)
  );

  const eligible = allCalculations.filter((c) => c.isEligible);

  // Sort by year one value
  eligible.sort((a, b) => b.yearOneValue - a.yearOneValue);
  const maxValue = eligible[0]?.yearOneValue ?? 1;

  // Apply priority boost for ranking
  const boosted = eligible.map((calc) => ({
    calc,
    score: calc.yearOneValue + priorityBoost(calc, answers.priority, maxValue),
  }));
  boosted.sort((a, b) => b.score - a.score);

  const top3 = boosted.slice(0, 3).map((b) => b.calc);

  return {
    top3,
    allCalculations,
    quizAnswers: answers,
  };
}

// A worked example, so a visitor can see a result without taking the quiz.
export const EXAMPLE_ANSWERS: QuizAnswers = {
  creditTier: 'none',
  spendingCategories: ['dining', 'groceries'],
  spendBucket: '500_1000',
  travelIntent: 'no',
  priority: 'maximize_cash',
};

export { SPEND_MIDPOINTS, categoryLabel };
