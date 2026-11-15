// Money: every figure on the results page against an independent oracle written from the issuers' own pages
// (support/card-terms.mjs, checked 15 November 2026) and the method the page states. Nothing here imports the
// app. The three hand-checked profiles are also pinned to numbers worked out by hand in audits/REPORT.md, so a
// mistake in the oracle cannot hide a mistake in the app.
import { test, expect, openResults, readPicks, shortName } from './helpers.mjs';
import { CARDS } from './support/card-terms.mjs';
import { expectedFigures, rankByYearOne } from './support/money-oracle.mjs';

const idByName = Object.fromEntries(Object.entries(CARDS).map(([id, c]) => [shortName(c.name), id]));

// Worked by hand in REPORT.md, "Three students, worked by hand".
const HAND_CHECKED = [
  {
    name: 'A, the example: no credit, eating out and groceries, $750 a month',
    answers: { creditTier: 'none', spendingCategories: ['dining', 'groceries'], spendBucket: '500_1000', travelIntent: 'no', priority: 'maximize_cash' },
    picks: [
      { id: 'discover-cash-back', yearOne: 406, later: 203 },
      { id: 'savor-student', yearOne: 284, later: 234 },
      { id: 'discover-chrome', yearOne: 260, later: 130 },
    ],
  },
  {
    name: 'B: good credit, online shopping then eating out then groceries, $1,500 a month, spends abroad',
    answers: { creditTier: 'good', spendingCategories: ['online_shopping', 'dining', 'groceries'], spendBucket: '1000_2000', travelIntent: 'yes', priority: 'maximize_cash' },
    picks: [
      { id: 'discover-cash-back', yearOne: 648, later: 324 },
      { id: 'bofa-customized', yearOne: 639, later: 239 },
      { id: 'freedom-flex', yearOne: 617, later: 417 },
    ],
  },
  {
    name: 'C: no credit, coffee then streaming then transit, $300 a month, wants it simple',
    answers: { creditTier: 'none', spendingCategories: ['coffee', 'streaming', 'transit'], spendBucket: 'under_500', travelIntent: 'maybe', priority: 'simplicity' },
    picks: [
      { id: 'savor-student', yearOne: 136, later: 86 },
      { id: 'quicksilver-student', yearOne: 104, later: 54 },
      { id: 'discover-cash-back', yearOne: 152, later: 76 },
    ],
  },
];

test.describe('hand-checked students', () => {
  for (const p of HAND_CHECKED) {
    test(`MONEY-01 MONEY-02 MONEY-04 ${p.name}`, async ({ page }) => {
      await openResults(page, p.answers);
      const shown = await readPicks(page);
      expect(shown.map(s => idByName[s.name])).toEqual(p.picks.map(x => x.id));
      for (const [i, want] of p.picks.entries()) {
        expect(shown[i], shown[i].name).toMatchObject({ yearOne: want.yearOne, later: want.later });
      }
    });
  }

  test('MONEY-01 the example names the card that pays more from year two', async ({ page }) => {
    await page.goto('/results?example=1');
    const note = page.locator('div', { has: page.getByText('Look past year one') }).last();
    await expect(note).toContainText('Capital One Savor Student Cash Rewards keeps paying $234 a year');
    await expect(note).toContainText('$203 for the top pick');
  });
});

// A spread of students: every credit answer and spending pattern, with the monthly range and the travel answer
// rotating so each appears with each.
const TIERS = ['none', 'good', 'excellent', 'unknown'];
const PATTERNS = [
  ['dining', 'groceries'],
  ['online_shopping'],
  ['coffee', 'streaming', 'transit'],
  ['even_split'],
  ['gas', 'transit'],
  ['groceries', 'streaming'],
  ['travel', 'dining', 'online_shopping'],
];
const BUCKETS = ['under_500', '500_1000', '1000_2000', 'over_2000'];

test.describe('every figure matches the oracle', () => {
  let n = 0;
  for (const creditTier of TIERS) {
    for (const spendingCategories of PATTERNS) {
      const spendBucket = BUCKETS[n % BUCKETS.length];
      const travelIntent = n % 2 ? 'yes' : 'no';
      n++;
      const answers = { creditTier, spendingCategories, spendBucket, travelIntent, priority: 'maximize_cash' };
      test(`${creditTier}, ${spendingCategories.join('+')}, ${spendBucket}, abroad ${travelIntent}`, async ({ page }) => {
        await openResults(page, answers);
        const shown = await readPicks(page);
        expect(shown.length).toBe(3);
        for (const s of shown) {
          const id = idByName[s.name];
          expect(id, `${s.name} is a card the oracle knows`).toBeTruthy();
          const want = expectedFigures(id, answers);
          expect({ card: s.name, yearOne: s.yearOne, later: s.later }).toEqual({ card: s.name, yearOne: want.yearOne, later: want.later });
        }
        // "The most money back" puts the card that pays most in year one first.
        const best = rankByYearOne(answers)[0];
        expect(shown[0].yearOne).toBe(best.yearOne);
        // And never shows a card above the student's credit answer.
        const allowed = rankByYearOne(answers).map(r => shortName(r.name));
        for (const s of shown) expect(allowed).toContain(s.name);
      });
    }
  }
});

test.describe('card terms on the page', () => {
  test('MONEY-02 Freedom Flex shows the $200 bonus Chase offers', async ({ page }) => {
    await page.goto('/cards');
    const card = page.locator('div', { has: page.getByRole('heading', { name: 'Chase Freedom Flex®' }) }).last();
    await expect(card).toContainText('$200 after $500 in 3 months');
  });

  test('MONEY-03 VentureOne is listed for excellent credit and kept from good credit', async ({ page }) => {
    await page.goto('/cards');
    const card = page.locator('div', { has: page.getByRole('heading', { name: 'Capital One VentureOne Rewards' }) }).last();
    await expect(card).toContainText(/Excellent/);
    for (const spendingCategories of [['travel'], ['even_split'], ['online_shopping']]) {
      const p = await page.context().newPage();
      await openResults(p, { creditTier: 'good', spendingCategories, spendBucket: 'over_2000', travelIntent: 'yes', priority: 'travel_rewards' });
      const names = (await readPicks(p)).map(s => s.name);
      expect(names).not.toContain('Capital One VentureOne Rewards');
      await p.close();
    }
  });

  test('MONEY-05 Citi Double Cash shows the $200 after $500 in 3 months offer', async ({ page }) => {
    await page.goto('/cards');
    const card = page.locator('div', { has: page.getByRole('heading', { name: 'Citi Double Cash® Card' }) }).last();
    await expect(card).toContainText('$200 after $500 in 3 months');
  });

  test('MONEY-01 the method names the 2026 calendars, not a half-the-time guess', async ({ page }) => {
    await page.goto('/results?example=1');
    await page.getByRole('button', { name: 'How these numbers are worked out' }).click();
    const method = page.locator('dl').last();
    await expect(method).toContainText('2026 calendar');
    await expect(method).not.toContainText('half the time');
    await expect(method).toContainText('Coffee shops count as eating out');
  });

  test('MONEY-07 the page says when the card terms were checked', async ({ page }) => {
    await page.goto('/results?example=1');
    await expect(page.getByText(/Card terms checked on each bank.s page on 15 November 2026/)).toBeVisible();
    await page.goto('/cards');
    await expect(page.getByText(/Terms checked on each bank.s page on 15 November 2026/)).toBeVisible();
  });
});
