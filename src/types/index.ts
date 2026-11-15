export type CreditTier =
  | 'none'
  | 'poor'
  | 'fair'
  | 'good'
  | 'excellent'
  | 'unknown';

export type SpendingCategory =
  | 'dining'
  | 'groceries'
  | 'coffee'
  | 'online_shopping'
  | 'streaming'
  | 'gas'
  | 'transit'
  | 'travel'
  | 'even_split';

export type SpendBucket =
  | 'under_500'
  | '500_1000'
  | '1000_2000'
  | 'over_2000';

export type TravelIntent = 'yes' | 'maybe' | 'no';

export type Priority =
  | 'maximize_cash'
  | 'simplicity'
  | 'credit_building'
  | 'travel_rewards';

export interface QuizAnswers {
  creditTier: CreditTier | null;
  spendingCategories: SpendingCategory[];
  spendBucket: SpendBucket | null;
  travelIntent: TravelIntent | null;
  priority: Priority | null;
}

export type RewardCategory =
  | SpendingCategory
  | 'base'
  | 'capital_one_travel'
  | 'bofa_travel_portal'
  | 'united_purchases'
  | 'delta_purchases'
  | 'citi_top_category';

export interface RewardRate {
  category: RewardCategory;
  rate: number;
  // Quiz categories this rate also pays on, when the bank's category is wider than its name
  covers?: SpendingCategory[];
  // Max purchases per quarter that earn this rate, shared by all capped rates on the card
  quarterlyCap?: number;
  // One of several categories the cardholder picks; only the chosen one earns this rate
  isChoice?: boolean;
  // Extra rate paid on top of `rate` during the first year only
  firstYearBonusRate?: number;
  centsPerMile?: number;
}

/** A 5% calendar that changes each quarter, as the bank published it. */
export interface RotatingCalendar {
  rate: number;
  // Combined purchases per quarter that earn the rotating rate
  quarterlyCap: number;
  // The calendar year these quarters come from
  year: number;
  // Four quarters, January to March first, each listing the quiz categories that earned the rate
  quarters: [SpendingCategory[], SpendingCategory[], SpendingCategory[], SpendingCategory[]];
  source: string;
}

export interface WelcomeBonus {
  amount: number;
  spendRequirement: number;
  timeframeMonths: number;
  isCashbackMatch?: boolean;
  isTravelCredit?: boolean;
  isMiles?: boolean;
  // Set when the bonus is earned by doing something other than spending
  earnedBy?: string;
}

export interface CardPerk {
  label: string;
  annualDollarValue: number;
  condition?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  issuer:
    | 'Discover'
    | 'Capital One'
    | 'Chase'
    | 'Bank of America'
    | 'Citi'
    | 'American Express'
    | 'WebBank';
  tagline: string;
  minCreditTier: CreditTier;
  isStudentCard: boolean;
  foreignTransactionFee: number;
  // Where the foreign fee was confirmed, when the issuer's page could not be
  // read by the audit's automated browser
  foreignTransactionFeeSource?: string;
  rewardRates: RewardRate[];
  rotating?: RotatingCalendar;
  baseRate: number;
  welcomeBonus: WelcomeBonus | null;
  perks: CardPerk[];
  applyUrl: string;
  requiresChaseChecking?: boolean;
  transferablePoints?: boolean;
  airlineCard?: boolean;
  airlinePartner?: string;
  universeReasoning: string;
  universeExclusions?: string;
  isExcluded?: boolean;
  filterTags: Array<'student' | 'travel' | 'cash_back' | 'credit_building' | 'airline'>;
}

export interface EarningsLine {
  label: string;
  annualAmount: number;
  isBonus?: boolean;
  isDeduction?: boolean;
}

export interface CardCalculation {
  card: CreditCard;
  yearOneValue: number;
  // What the card keeps paying once the first-year extras are gone
  everyYearValue: number;
  // Welcome bonus or Cashback Match: paid once, in year one only
  firstYearOnlyValue: number;
  earningsBreakdown: EarningsLine[];
  welcomeBonusValue: number;
  perksValue: number;
  foreignFeeImpact: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  didQualifyForBonus: boolean;
  monthlySpendUsed: number;
  annualSpendUsed: number;
}

export interface RecommendationResult {
  top3: CardCalculation[];
  allCalculations: CardCalculation[];
  quizAnswers: QuizAnswers;
}
