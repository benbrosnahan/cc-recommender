// An independent money oracle for Card Picker, written from the issuers' terms in card-terms.mjs and the
// method the results page states under "How these numbers are worked out". It never imports the app.
//
// The method, as stated to the student:
//   * Spending is the point inside the chosen range: $300, $750, $1,500 or $2,500 a month.
//   * One category: 80% there, 20% everywhere else. Two: 45%, 35%, 20%. Three: 40%, 30%, 20%, 10%.
//     "Evenly split" or nothing: equal parts eating out, groceries, gas, online shopping, streaming, transit.
//   * Coffee shops are restaurants to every issuer here (Discover's terms name cafes), so coffee earns dining rates.
//   * Spending is even across the four quarters. A combined quarterly cap is shared pro rata by the categories
//     under it. Rotating 5% follows the issuer's 2026 calendar.
//   * A welcome bonus counts when the monthly figure times the bonus window reaches the requirement.
//   * Discover's Cashback Match equals the first year's cash back.
//   * Saying yes to spending abroad puts a fifth of spending abroad, and the card's foreign fee comes off.
//   * Miles and points are worth 1 cent.
import { CARDS } from './card-terms.mjs';

export const MONTHLY = { under_500: 300, '500_1000': 750, '1000_2000': 1500, over_2000: 2500 };
const EVEN = ['dining', 'groceries', 'gas', 'online_shopping', 'streaming', 'transit'];
const TIERS = ['none', 'poor', 'fair', 'good', 'excellent'];

const level = tier => TIERS.indexOf(tier === 'unknown' ? 'good' : tier);

/** Annual dollars per quiz category, with coffee folded into dining. 'other' is everything else. */
export function annualSpend(answers) {
  const annual = MONTHLY[answers.spendBucket ?? 'under_500'] * 12;
  const cats = answers.spendingCategories ?? [];
  const parts = {};
  const add = (cat, share) => {
    const key = cat === 'coffee' ? 'dining' : cat;
    parts[key] = (parts[key] ?? 0) + annual * share;
  };
  if (cats.length === 0 || cats.includes('even_split')) {
    for (const c of EVEN) add(c, 1 / EVEN.length);
  } else if (cats.length === 1) {
    add(cats[0], 0.8); add('other', 0.2);
  } else if (cats.length === 2) {
    add(cats[0], 0.45); add(cats[1], 0.35); add('other', 0.2);
  } else {
    add(cats[0], 0.4); add(cats[1], 0.3); add(cats[2], 0.2); add('other', 0.1);
  }
  return { annual, parts };
}

/** Takes up to `cap` from the listed categories' remaining spend, pro rata. Returns dollars taken per category. */
function takeProRata(remaining, cats, cap) {
  const eligible = cats.reduce((s, c) => s + (remaining[c] ?? 0), 0);
  const taken = {};
  if (eligible <= 0) return taken;
  const scale = Math.min(1, cap / eligible);
  for (const c of cats) {
    const t = (remaining[c] ?? 0) * scale;
    if (t > 0) {
      taken[c] = t;
      remaining[c] -= t;
    }
  }
  return taken;
}

/** One card's yearly rewards for a spending split: { rewards, firstYearRateExtra }. */
export function cardRewards(card, parts) {
  let rewards = 0;
  let firstYearRateExtra = 0;
  // The choice category: the option covering the most spending.
  let chosen = null;
  if (card.choice) {
    let best = -1;
    for (const o of card.choice) {
      const dollars = o.covers.reduce((s, c) => s + (parts[c] ?? 0), 0);
      if (dollars > best) { best = dollars; chosen = o; }
    }
  }
  for (let q = 0; q < 4; q++) {
    const remaining = Object.fromEntries(Object.entries(parts).map(([c, v]) => [c, v / 4]));
    if (card.rotating) {
      const active = card.rotating.quarters[q].filter(c => remaining[c] > 0);
      const taken = takeProRata(remaining, active, card.rotating.cap);
      for (const t of Object.values(taken)) rewards += t * card.rotating.rate;
    }
    // Capped fixed rates share one combined quarterly cap.
    const capped = card.fixed.filter(f => f.capped).map(f => f.cat);
    const choiceCats = chosen ? chosen.covers.filter(c => remaining[c] > 0) : [];
    if (card.cap) {
      const pool = [...choiceCats, ...capped];
      const taken = takeProRata(remaining, pool, card.cap);
      for (const [c, t] of Object.entries(taken)) {
        if (choiceCats.includes(c)) {
          rewards += t * card.choiceRate;
          firstYearRateExtra += t * (card.choiceFirstYearExtra ?? 0);
        } else {
          rewards += t * card.fixed.find(f => f.cat === c).rate;
        }
      }
    }
    for (const f of card.fixed.filter(f => !f.capped)) {
      const t = remaining[f.cat] ?? 0;
      rewards += t * f.rate;
      remaining[f.cat] = 0;
    }
    for (const v of Object.values(remaining)) rewards += v * card.base;
  }
  return { rewards, firstYearRateExtra };
}

/** What the results page should show for one card: whole dollars, as the page rounds them. */
export function expectedFigures(cardId, answers) {
  const card = CARDS[cardId];
  const { annual, parts } = annualSpend(answers);
  const monthly = annual / 12;
  const { rewards, firstYearRateExtra } = cardRewards(card, parts);
  const fxCost = answers.travelIntent === 'yes' ? annual * 0.2 * card.fx : 0;
  const bonus = card.bonus && (card.bonus.spend === 0 || monthly * card.bonus.months >= card.bonus.spend)
    ? card.bonus.value
    : 0;
  const match = card.match ? rewards : 0;
  const everyYear = rewards - fxCost;
  const firstYearOnly = match + bonus + firstYearRateExtra;
  const later = Math.round(everyYear);
  const extra = Math.round(firstYearOnly);
  return { later, extra, yearOne: later + extra, exact: { everyYear, firstYearOnly } };
}

/** The cards a student with this answer can be shown. */
export function eligibleCards(answers) {
  const mine = level(answers.creditTier ?? 'none');
  return Object.entries(CARDS).filter(([, c]) => mine >= level(c.tier)).map(([id]) => id);
}

/** Eligible cards by year-one dollars, highest first: the order a "most money back" student should see. */
export function rankByYearOne(answers) {
  return eligibleCards(answers)
    .map(id => ({ id, name: CARDS[id].name, ...expectedFigures(id, answers) }))
    .sort((a, b) => b.exact.everyYear + b.exact.firstYearOnly - (a.exact.everyYear + a.exact.firstYearOnly));
}
