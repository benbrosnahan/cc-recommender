import {
  QuizAnswers,
  CreditCard,
  CreditTier,
  SpendBucket,
  SpendingCategory,
  CardCalculation,
  EarningsLine,
  RecommendationResult,
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

// Citi Custom Cash: 5% on up to $500 spent per billing cycle in the top eligible category
const CUSTOM_CASH_CYCLE_CAP = 500;

// Rotating categories: assume roughly 2 of 4 quarterly categories match a given spending category
const ROTATING_MATCH_SHARE = 0.5;

interface AllocationEarnings {
  earned: number;
  cappedDollarsUsed: number;
  // Paid in year one only, on top of `earned`
  firstYearExtra: number;
}

function earningsForAllocation(
  card: CreditCard,
  alloc: CategoryAllocation,
  userTopCategory: SpendingCategory | null,
  cappedRoomLeft: number,
  chosenCategory: string | null
): AllocationEarnings {
  const { category, annualDollars } = alloc;
  const atBase = { earned: annualDollars * card.baseRate, cappedDollarsUsed: 0, firstYearExtra: 0 };
  if (category === 'base') return atBase;

  // Citi Custom Cash: 5% on the top category up to the per-cycle cap, 1% after
  if (card.id === 'citi-custom-cash') {
    if (category !== userTopCategory) return atBase;
    const bonusDollars = Math.min(annualDollars, CUSTOM_CASH_CYCLE_CAP * 12);
    return {
      earned: bonusDollars * 0.05 + (annualDollars - bonusDollars) * card.baseRate,
      cappedDollarsUsed: 0,
      firstYearExtra: 0,
    };
  }

  const match = card.rewardRates.find((r) => r.category === category);
  if (!match) return atBase;
  // Choice-category cards (BofA Customized Cash) only pay the elevated rate on the one category picked
  if (match.isChoice && category !== chosenCategory) return atBase;

  // Rotating categories only earn the elevated rate in quarters where the category matches
  const quartersActive = match.isRotating ? 4 * ROTATING_MATCH_SHARE : 4;
  let bonusDollars = (annualDollars * quartersActive) / 4;
  if (match.quarterlyCap) {
    bonusDollars = Math.min(bonusDollars, match.quarterlyCap * quartersActive, cappedRoomLeft);
  }

  return {
    earned: bonusDollars * match.rate + (annualDollars - bonusDollars) * card.baseRate,
    cappedDollarsUsed: match.quarterlyCap ? bonusDollars : 0,
    firstYearExtra: bonusDollars * (match.firstYearBonusRate ?? 0),
  };
}

function calculateCard(
  card: CreditCard,
  answers: QuizAnswers,
  annualSpend: number,
  monthlySpend: number,
  allocations: CategoryAllocation[],
  userTopCategory: SpendingCategory | null
): CardCalculation {
  const userTier = answers.creditTier ?? 'none';
  const eligible = isEligible(card, userTier);

  const breakdown: EarningsLine[] = [];
  let categoryEarnings = 0;
  let firstYearRateBonus = 0;

  if (eligible) {
    // Quarterly caps are on combined purchases, so capped categories share one yearly pool
    const quarterlyCap = card.rewardRates.find((r) => r.quarterlyCap)?.quarterlyCap;
    let cappedRoomLeft = quarterlyCap ? quarterlyCap * 4 : Infinity;
    // Assume the cardholder picks the choice category where they spend the most
    const choiceCats = card.rewardRates.filter((r) => r.isChoice).map((r) => r.category as string);
    const chosenCategory =
      allocations
        .filter((a) => choiceCats.includes(a.category as string))
        .sort((a, b) => b.annualDollars - a.annualDollars)[0]?.category ?? null;
    for (const alloc of allocations) {
      if (alloc.annualDollars === 0) continue;
      const { earned, cappedDollarsUsed, firstYearExtra } = earningsForAllocation(
        card,
        alloc,
        userTopCategory,
        cappedRoomLeft,
        chosenCategory as string | null
      );
      cappedRoomLeft -= cappedDollarsUsed;
      if (earned > 0 && alloc.category !== 'base') {
        const label = categoryLabel(alloc.category as SpendingCategory);
        breakdown.push({ label, annualAmount: earned });
      }
      if (earned > 0 && alloc.category === 'base') {
        breakdown.push({ label: 'Everything else', annualAmount: earned });
      }
      categoryEarnings += earned;
      firstYearRateBonus += firstYearExtra;
    }
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
    const isFlat = card.rewardRates.every((r) => !r.isRotating) && card.rewardRates.length <= 1;
    if (isFlat && withinRange) return 80;
    if (card.rewardRates.some((r) => r.isRotating)) return -50;
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
  const userTopCategory = categories.includes('even_split') ? null : (categories[0] ?? null);

  const allCalculations = ACTIVE_CARDS.map((card) =>
    calculateCard(card, answers, annualSpend, monthlySpend, allocations, userTopCategory)
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
