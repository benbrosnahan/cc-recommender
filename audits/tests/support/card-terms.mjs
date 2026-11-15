// Card terms as each issuer's own page stated them on 15 November 2026. This file is the oracle's data and is
// written from those pages, not from src/data/cards.ts: the money tests compare the app against it, so it must
// never import the app's code. Every card carries the URL it was read from. When an issuer changes an offer,
// update the card here first, watch the money test fail, then update the app.
//
// Rates are cash back per dollar. Miles and points are valued at 1 cent each, as the app's method says.

export const CHECKED_ON = '2026-11-15';

// The 5% quarterly calendars for calendar year 2026, the last full year each issuer has published.
// Categories map onto the quiz's spending categories. Transit is left out of both: Discover's Q3
// "transportation" excludes taxi and rideshare, and Chase's Q3 "public transit" names no rideshare, while the
// quiz's transit answer is "Uber, Lyft, subway, bus". Leaving it out can only understate.
export const DISCOVER_2026 = {
  source: 'https://www.discover.com/credit-cards/cash-back/cashback-calendar.html',
  quarters: [
    ['groceries', 'streaming'], // Jan-Mar: grocery stores, wholesale clubs, select streaming
    ['dining'], // Apr-Jun: restaurants (cafes included), home improvement
    ['gas'], // Jul-Sep: gas stations, transportation, drug stores
    ['dining'], // Oct-Dec: restaurants, entertainment, utilities
  ],
};
export const CHASE_FLEX_2026 = {
  sources: [
    'https://media.chase.com/news/chase-freedom-2026-q1-categories',
    'https://media.chase.com/news/chase-freedom-2026-q2-categories',
    'https://creditcards.chase.com/cash-back-credit-cards/freedom/flex',
  ],
  quarters: [
    ['dining'], // Jan-Mar: dining, American Heart Association, Norwegian Cruise Line
    ['online_shopping'], // Apr-Jun: Amazon and Whole Foods Market, Chase Travel, Feeding America
    ['gas'], // Jul-Sep: gas stations, public transit, EV charging, live entertainment, United Way
    ['groceries', 'dining'], // Oct-Dec: grocery stores (not Walmart or Target), dining, American Red Cross
  ],
};

/**
 * tier: the lowest quiz answer the card is shown to. none < poor < fair < good < excellent.
 * fixed: elevated rates that apply all year. cap: combined quarterly cap shared by every capped fixed rate.
 * choice: rates where the cardholder picks one; covers lists the quiz categories the issuer's choice includes.
 * rotating: 5% calendar with its own combined quarterly cap.
 * bonus: { value, spend, months } counted when monthly spend x months reaches spend. match: Cashback Match.
 */
export const CARDS = {
  'discover-cash-back': {
    name: 'Discover it® Student Cash Back',
    url: 'https://www.discover.com/credit-cards/student-credit-card/it-card/',
    terms: 'https://disclosures.capitalone.com/disclosure.42653.en-US.html',
    tier: 'none', base: 0.01, fx: 0, fixed: [], rotating: { rate: 0.05, cap: 1500, ...DISCOVER_2026 },
    match: true, bonus: null,
  },
  'discover-chrome': {
    name: 'Discover it® Student Chrome',
    url: 'https://www.discover.com/credit-cards/student-credit-card/chrome-card/',
    terms: 'https://disclosures.capitalone.com/disclosure.42664.en-US.html',
    tier: 'none', base: 0.01, fx: 0, cap: 1000,
    fixed: [{ cat: 'gas', rate: 0.02, capped: true }, { cat: 'dining', rate: 0.02, capped: true }],
    match: true, bonus: null,
  },
  'savor-student': {
    name: 'Capital One Savor Student Cash Rewards',
    url: 'https://www.capitalone.com/credit-cards/savor-student/',
    tier: 'none', base: 0.01, fx: 0,
    fixed: [{ cat: 'dining', rate: 0.03 }, { cat: 'groceries', rate: 0.03 }, { cat: 'streaming', rate: 0.03 }],
    bonus: { value: 50, spend: 100, months: 3 },
  },
  'quicksilver-student': {
    name: 'Capital One Quicksilver Student Cash Rewards',
    url: 'https://www.capitalone.com/credit-cards/quicksilver-student/',
    tier: 'none', base: 0.015, fx: 0, fixed: [], bonus: { value: 50, spend: 100, months: 3 },
  },
  'freedom-rise': {
    name: 'Chase Freedom Rise®',
    url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/rise',
    terms: 'https://sites.chase.com/services/creatives/pricingandterms.html/content/dam/pricingandterms/LGC65397.html',
    tier: 'none', base: 0.015, fx: 0.03, fixed: [],
    // $25 statement credit for enrolling in autopay in the first 3 months: no spending needed.
    bonus: { value: 25, spend: 0, months: 3 },
  },
  'freedom-unlimited': {
    name: 'Chase Freedom Unlimited®',
    url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited',
    terms: 'https://sites.chase.com/services/creatives/pricingandterms.html/content/dam/pricingandterms/LGC65873.html',
    tier: 'good', base: 0.015, fx: 0.03, fixed: [{ cat: 'dining', rate: 0.03 }],
    bonus: { value: 200, spend: 500, months: 3 },
  },
  'freedom-flex': {
    name: 'Chase Freedom Flex®',
    url: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/flex',
    terms: 'https://sites.chase.com/services/creatives/pricingandterms.html/content/dam/pricingandterms/LGC60938.html',
    tier: 'good', base: 0.01, fx: 0, fixed: [{ cat: 'dining', rate: 0.03 }],
    rotating: { rate: 0.05, cap: 1500, ...CHASE_FLEX_2026 },
    bonus: { value: 200, spend: 500, months: 3 },
  },
  ventureone: {
    name: 'Capital One VentureOne Rewards',
    url: 'https://www.capitalone.com/credit-cards/ventureone/',
    // The page says "Credit Level: EXCELLENT".
    tier: 'excellent', base: 0.0125, fx: 0, fixed: [], bonus: { value: 200, spend: 500, months: 3 },
  },
  'united-gateway': {
    name: 'United Gateway℠ Card',
    url: 'https://creditcards.chase.com/travel-credit-cards/united/united-gateway',
    tier: 'good', base: 0.01, fx: 0, fixed: [{ cat: 'gas', rate: 0.02 }, { cat: 'transit', rate: 0.02 }],
    bonus: { value: 400, spend: 1000, months: 3 },
  },
  'delta-blue': {
    name: 'Delta SkyMiles® Blue American Express Card',
    url: 'https://www.americanexpress.com/us/credit-cards/card/delta-skymiles-blue-american-express-card/',
    tier: 'good', base: 0.01, fx: 0, fixed: [{ cat: 'dining', rate: 0.02 }],
    bonus: { value: 100, spend: 1000, months: 6 },
  },
  'citi-double-cash': {
    name: 'Citi Double Cash® Card',
    url: 'https://www.citi.com/credit-cards/citi-double-cash-credit-card',
    tier: 'excellent', base: 0.02, fx: 0.03, fixed: [], bonus: { value: 200, spend: 500, months: 3 },
  },
  'bofa-customized': {
    name: 'BofA Customized Cash Rewards for Students',
    url: 'https://www.bankofamerica.com/credit-cards/products/student-cash-back-credit-card/',
    // The product page does not state a foreign fee; third-party reviews list 3%. Unverified at the issuer.
    tier: 'good', base: 0.01, fx: 0.03, cap: 2500,
    choice: [
      { option: 'dining', covers: ['dining', 'coffee'] },
      { option: 'online_shopping', covers: ['online_shopping', 'streaming'] },
      { option: 'gas', covers: ['gas'] },
      { option: 'travel', covers: ['travel'] },
    ],
    choiceRate: 0.03, choiceFirstYearExtra: 0.03,
    fixed: [{ cat: 'groceries', rate: 0.02, capped: true }],
    bonus: { value: 200, spend: 1000, months: 3 },
  },
  'bofa-travel-student': {
    name: 'BofA Travel Rewards for Students',
    url: 'https://www.bankofamerica.com/credit-cards/products/student-rewards-credit-card/',
    tier: 'good', base: 0.015, fx: 0, fixed: [], bonus: { value: 250, spend: 1000, months: 3 },
  },
};

// Researched and left out. Citi Custom Cash: "Citi is no longer accepting applications ... as of May 28, 2026"
// (https://www.citi.com/credit-cards/citi-custom-cash-credit-card).
export const NOT_RECOMMENDED = ['citi-custom-cash', 'aa-mileup', 'bankamericard-student', 'petal-2'];
