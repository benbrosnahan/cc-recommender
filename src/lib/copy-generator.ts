import { CardCalculation, QuizAnswers, SpendingCategory } from '@/types';
import { isFlatRate } from '@/lib/utils';

const QUARTER_WORD: Partial<Record<SpendingCategory, string>> = {
  dining: 'eating out',
  groceries: 'groceries',
  streaming: 'streaming',
  gas: 'gas',
  online_shopping: 'Amazon',
};

// The travel priority ranks Chase cards up for their points, but a Freedom
// card cannot send points to airlines or hotels itself. Chase's rewards
// agreement lets points move to another Chase card you hold, and its Sapphire
// Preferred page (annual fee $95) is where partner transfers are offered.
export const CHASE_SAPPHIRE_NOTE =
  'Moving them to airlines and hotels needs a Sapphire card later on, which has an annual fee ($95 for Sapphire Preferred).';

const COUNT = ['no', 'one', 'two', 'three', 'four'];

export function generateWhyBullets(calc: CardCalculation, answers: QuizAnswers): string[] {
  const { card, welcomeBonusValue, didQualifyForBonus } = calc;
  const bullets: string[] = [];

  // No foreign fee + travel
  if (card.foreignTransactionFee === 0 && answers.travelIntent === 'yes') {
    bullets.push('No foreign transaction fee, which matters for your time abroad');
  }

  // No foreign fee + maybe travel
  if (card.foreignTransactionFee === 0 && answers.travelIntent === 'maybe') {
    bullets.push('No foreign transaction fee, so you are covered if you do end up abroad');
  }

  // Transferable points + travel priority
  if (card.transferablePoints && answers.priority === 'travel_rewards') {
    if (card.issuer === 'Chase') {
      bullets.push(
        `Earns Chase points that count toward travel. ${CHASE_SAPPHIRE_NOTE}`
      );
    } else if (card.issuer === 'Capital One') {
      bullets.push(
        'Earns Capital One miles, which transfer to travel partners including Air Canada and Turkish Airlines'
      );
    }
  }

  // Airline card
  if (card.airlineCard && card.airlinePartner) {
    bullets.push(`Earns ${card.airlinePartner} miles directly, which add up toward a free flight`);
  }

  // No credit needed
  if (
    (answers.creditTier === 'none' || answers.creditTier === 'poor') &&
    card.minCreditTier === 'none'
  ) {
    if (card.issuer === 'Discover') {
      bullets.push('Built for students with no credit history. Discover does not require a credit score to apply');
    } else if (card.id === 'freedom-rise') {
      bullets.push('Chase lists this card as best for people who are new to credit');
    } else {
      bullets.push('A student card, aimed at people building credit for the first time');
    }
  }

  // Rotating 5%: say how often the student's own categories came up last year
  const picked = answers.spendingCategories.map((c) => (c === 'coffee' ? 'dining' : c));
  if (card.rotating) {
    const hits = picked
      .filter((c, i) => picked.indexOf(c) === i && QUARTER_WORD[c])
      .map((c) => ({ c, n: card.rotating!.quarters.filter((q) => q.includes(c)).length }))
      .filter((h) => h.n > 0)
      .sort((a, b) => b.n - a.n);
    if (hits.length > 0) {
      const { c, n } = hits[0];
      bullets.push(
        `In ${card.rotating.year}, the 5% covered ${QUARTER_WORD[c]} in ${COUNT[n]} of four quarters. You switch it on each quarter`
      );
    }
  }

  // Strong dining rate. Coffee shops count as restaurants to the banks.
  const diningRate = card.rewardRates.find((r) => r.category === 'dining' && !r.isChoice);
  const eatsOut = picked.includes('dining');
  if (eatsOut && diningRate && diningRate.rate >= 0.02) {
    const n = (diningRate.rate * 100).toFixed(0);
    const rank = picked[0] === 'dining' ? 'your biggest category' : 'one of your top categories';
    const what = answers.spendingCategories.includes('coffee') ? 'eating out and coffee' : 'eating out';
    if (diningRate.centsPerMile) {
      bullets.push(`Earns ${n} miles per dollar on ${what}, ${rank}`);
    } else {
      bullets.push(`Earns ${n}% back on ${what}${card.rotating ? ' all year' : ''}, ${rank}`);
    }
  }

  // Savor student category match
  if (card.id === 'savor-student') {
    const also = (['groceries', 'streaming'] as const).filter((c) => answers.spendingCategories.includes(c));
    if (also.length === 2) bullets.push('3% back on groceries and streaming, two places you said your money goes');
    if (also.length === 1) bullets.push(`3% back on ${also[0]}, where you said your money goes`);
  }

  // Citi Custom Cash auto-optimization
  if (card.id === 'citi-custom-cash') {
    bullets.push(
      'Pays 5% on whatever you spend the most on each billing cycle, with nothing to activate or track'
    );
  }

  // Cashback Match
  if (card.welcomeBonus?.isCashbackMatch) {
    bullets.push('Cashback Match doubles everything you earn in year one, with no cap and no minimum spend');
  }

  // Welcome bonus qualified
  if (didQualifyForBonus && welcomeBonusValue >= 100) {
    const reach = 'you would reach on your normal spending';
    if (card.welcomeBonus?.isMiles) {
      const miles = (welcomeBonusValue * 100).toLocaleString();
      bullets.push(`Comes with a welcome bonus of ${miles} miles, worth about $${welcomeBonusValue}, which ${reach}`);
    } else if (card.welcomeBonus?.isTravelCredit) {
      bullets.push(`Comes with a $${welcomeBonusValue} welcome bonus, paid as credit toward travel, which ${reach}`);
    } else {
      bullets.push(`Comes with a $${welcomeBonusValue} welcome bonus ${reach}`);
    }
  }

  // Welcome bonus guaranteed (Capital One $50 for $100)
  if (
    didQualifyForBonus &&
    welcomeBonusValue === 50 &&
    (card.id === 'savor-student' || card.id === 'quicksilver-student')
  ) {
    bullets.push('$50 bonus after your first $100 in purchases, which is close to guaranteed');
  }

  // Simplicity for flat-rate cards
  if (answers.priority === 'simplicity' && isFlatRate(card)) {
    const n = parseFloat((card.baseRate * 100).toFixed(2));
    const rate = card.welcomeBonus?.isMiles ? `${n} miles per dollar` : `${n}%`;
    bullets.push(`A flat ${rate} on every purchase, so there are no categories to track`);
  }

  // Credit building
  if (answers.priority === 'credit_building' && card.isStudentCard) {
    bullets.push('Reports to all three credit bureaus every month, so each on-time payment builds your score');
  }

  // Chase ecosystem path
  if (card.id === 'freedom-rise') {
    bullets.push(
      'A way into Chase: you can move up to Freedom Unlimited or a Sapphire card as your credit grows'
    );
  }

  return bullets.slice(0, 3);
}

export function generateCaveat(calc: CardCalculation, answers: QuizAnswers): string {
  const { card, didQualifyForBonus } = calc;

  // For someone heading abroad, where the card works matters more than anything else about it
  if (card.issuer === 'Discover' && answers.travelIntent === 'yes') {
    return 'Discover is accepted in fewer places abroad than Visa or Mastercard. If you will be overseas for long, carry a second card on one of those networks.';
  }

  if (card.id === 'freedom-rise' && card.requiresChaseChecking) {
    return 'Chase says having at least $250 in a Chase checking or savings account raises your chances of approval.';
  }

  if (card.foreignTransactionFee > 0 && answers.travelIntent !== 'no') {
    return 'It charges a 3% fee on purchases made abroad. If you travel, a no-fee card will serve you better.';
  }

  if (!didQualifyForBonus && calc.welcomeBonusValue === 0 && card.welcomeBonus && !card.welcomeBonus.isCashbackMatch) {
    const req = card.welcomeBonus.spendRequirement;
    return `The $${card.welcomeBonus.amount} welcome bonus needs $${req.toLocaleString()} of spending in ${card.welcomeBonus.timeframeMonths} months. At your spending you would likely miss it, so it is not counted here.`;
  }

  if (card.id === 'discover-cash-back') {
    return 'You have to switch on the 5% categories in the Discover app every quarter. Miss it and those purchases earn 1%, so set a reminder.';
  }

  if (card.id === 'savor-student') {
    return 'The 3% on groceries does not apply at superstores like Walmart and Target. Those purchases earn 1%.';
  }

  if (card.id === 'freedom-flex') {
    return 'You have to switch on the 5% categories with Chase every quarter. Miss it and those purchases earn 1%, or 3% on dining.';
  }

  if (card.id === 'citi-double-cash') {
    return 'You only get the second 1% when you pay the bill. Carry a balance and you lose it, and pay interest on top.';
  }

  if (card.id === 'bofa-customized') {
    return 'You pick the 3% category yourself, in the app or online, and can change it once a month. The 3% and 2% stop at $2,500 a quarter, combined.';
  }

  if (card.id === 'delta-blue') {
    return 'SkyMiles can be hard to use at good value. This card only makes sense if you fly Delta often.';
  }

  if (card.id === 'citi-custom-cash') {
    return 'The 5% stops after $500 in your top category each billing cycle. Spending past that earns 1%.';
  }

  if (card.id === 'united-gateway') {
    return 'The miles are worth the most on United flights and less on partner airlines.';
  }

  if (card.minCreditTier === 'excellent') {
    return 'This card is usually for excellent credit, about 740 or more. Check your score first, because a declined application still shows on your report.';
  }

  if (card.minCreditTier === 'good') {
    return 'This card is usually for good credit, about 670 or more. Check your score first, because a declined application still shows on your report.';
  }

  if (card.issuer === 'Discover') {
    return 'Discover works almost everywhere in the US but is accepted in fewer places abroad than Visa or Mastercard.';
  }

  return 'Banks change offers without notice. Read the terms on the bank\'s page before you apply.';
}
