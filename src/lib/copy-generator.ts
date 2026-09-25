import { CardCalculation, QuizAnswers } from '@/types';

export function generateWhyBullets(calc: CardCalculation, answers: QuizAnswers): string[] {
  const { card, welcomeBonusValue, didQualifyForBonus } = calc;
  const bullets: string[] = [];

  // No foreign fee + travel
  if (card.foreignTransactionFee === 0 && answers.travelIntent === 'yes') {
    bullets.push('No foreign transaction fees — ideal for your study abroad plans');
  }

  // No foreign fee + maybe travel
  if (card.foreignTransactionFee === 0 && answers.travelIntent === 'maybe') {
    bullets.push('No foreign transaction fees — covers you if your travel plans change');
  }

  // Transferable points + travel priority
  if (card.transferablePoints && answers.priority === 'travel_rewards') {
    if (card.issuer === 'Chase') {
      bullets.push(
        'Earns Chase Ultimate Rewards — transferable to airline and hotel partners when you upgrade to a Sapphire card'
      );
    } else if (card.issuer === 'Capital One') {
      bullets.push(
        'Earns Capital One miles — flexible and transferable to travel partners including Air Canada, Turkish Airlines, and more'
      );
    }
  }

  // Airline card
  if (card.airlineCard && card.airlinePartner) {
    bullets.push(`Earns ${card.airlinePartner} miles directly — great for building toward a free flight`);
  }

  // No credit needed
  if (
    (answers.creditTier === 'none' || answers.creditTier === 'poor') &&
    card.minCreditTier === 'none'
  ) {
    bullets.push('Designed for students with no credit history — no score required to apply');
  }

  // Strong dining rate
  const diningRate = card.rewardRates.find((r) => r.category === 'dining');
  if (
    answers.spendingCategories.includes('dining') &&
    diningRate &&
    diningRate.rate >= 0.02
  ) {
    const pct = diningRate.isRotating
      ? `up to ${(diningRate.rate * 100).toFixed(0)}%`
      : `${(diningRate.rate * 100).toFixed(0)}%`;
    bullets.push(`Earns ${pct} back on dining and delivery — your top spending category`);
  }

  // Savor student category match
  if (
    card.id === 'savor-student' &&
    (answers.spendingCategories.includes('streaming') ||
      answers.spendingCategories.includes('groceries'))
  ) {
    bullets.push('3% back on streaming services and groceries — major student spending categories');
  }

  // Citi Custom Cash auto-optimization
  if (card.id === 'citi-custom-cash') {
    bullets.push(
      'Automatically earns 5% on your top spending category each billing cycle — no activation or tracking required'
    );
  }

  // Cashback Match
  if (card.welcomeBonus?.isCashbackMatch) {
    bullets.push('Cashback Match doubles all your year-one earnings — no cap, no minimum spend');
  }

  // Welcome bonus qualified
  if (didQualifyForBonus && welcomeBonusValue >= 100) {
    bullets.push(
      `Includes a $${welcomeBonusValue} welcome bonus — reachable within your normal spending`
    );
  }

  // Welcome bonus guaranteed (Capital One $50 for $100)
  if (
    didQualifyForBonus &&
    welcomeBonusValue === 50 &&
    (card.id === 'savor-student' || card.id === 'quicksilver-student')
  ) {
    bullets.push('$50 bonus after your first $100 in purchases — essentially guaranteed on day one');
  }

  // Simplicity for flat-rate cards
  if (
    answers.priority === 'simplicity' &&
    card.rewardRates.every((r) => !r.isRotating)
  ) {
    const pct = (card.baseRate * 100).toFixed(1).replace('.0', '');
    bullets.push(`Flat ${pct}% on every purchase — no categories to track, ever`);
  }

  // Credit building
  if (answers.priority === 'credit_building' && card.isStudentCard) {
    bullets.push('Reports to all three credit bureaus monthly — every on-time payment builds your score');
  }

  // Chase ecosystem path
  if (card.id === 'freedom-rise') {
    bullets.push(
      'Your entry point to the Chase ecosystem — upgrade to Freedom Unlimited or Sapphire as your credit grows'
    );
  }

  return bullets.slice(0, 3);
}

export function generateCaveat(calc: CardCalculation, answers: QuizAnswers): string {
  const { card, didQualifyForBonus } = calc;

  if (card.id === 'freedom-rise' && card.requiresChaseChecking) {
    return 'Approval odds improve significantly if you have a Chase checking account with at least $250';
  }

  if (card.foreignTransactionFee > 0 && answers.travelIntent !== 'no') {
    return 'Charges a 3% fee on international purchases — consider a no-fee alternative if you travel abroad';
  }

  if (!didQualifyForBonus && calc.welcomeBonusValue === 0 && card.welcomeBonus && !card.welcomeBonus.isCashbackMatch) {
    const req = card.welcomeBonus.spendRequirement;
    return `The $${card.welcomeBonus.amount} welcome bonus requires $${req.toLocaleString()} in ${card.welcomeBonus.timeframeMonths} months — your spending may not qualify`;
  }

  if (card.id === 'discover-cash-back') {
    return 'The 5% rotating categories require quarterly activation through the Discover app — set a reminder or earnings fall to 1%';
  }

  if (card.id === 'freedom-flex') {
    return "Rotating 5% categories must be activated each quarter through Chase — worth the extra step, but don't forget";
  }

  if (card.id === 'citi-double-cash') {
    return 'The full 2% requires on-time payment — carrying a balance forfeits the second 1% and accrues interest';
  }

  if (card.id === 'bofa-customized') {
    return "Your 3% category must be selected online before using — it defaults to gas if you don't choose";
  }

  if (card.id === 'delta-blue') {
    return 'Delta SkyMiles can be difficult to redeem at peak value — best if you fly Delta regularly from a nearby hub';
  }

  if (card.id === 'citi-custom-cash') {
    return '5% only applies to the first $500 in your top category per billing cycle ($6,000/year) — additional spending earns 1%';
  }

  if (card.id === 'united-gateway') {
    return 'Miles are most valuable when redeemed on United flights — redemption value can vary for partner airlines';
  }

  if (card.minCreditTier === 'excellent') {
    return 'Typically requires a credit score of 700+ — approval is not guaranteed for everyone';
  }

  if (card.minCreditTier === 'good') {
    return 'Typically requires a credit score of 670+ — confirm your score before applying to avoid a hard pull';
  }

  if (card.issuer === 'Discover') {
    return 'Discover is accepted at 99% of US merchants but has less international acceptance than Visa or Mastercard';
  }

  return 'Always review the full cardholder agreement before applying — terms and offers may change';
}
