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
  isRotating?: boolean;
  centsPerMile?: number;
}

export interface WelcomeBonus {
  amount: number;
  spendRequirement: number;
  timeframeMonths: number;
  isCashbackMatch?: boolean;
  isTravelCredit?: boolean;
  isMiles?: boolean;
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
    | 'American Express';
  tagline: string;
  minCreditTier: CreditTier;
  isStudentCard: boolean;
  foreignTransactionFee: number;
  rewardRates: RewardRate[];
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
