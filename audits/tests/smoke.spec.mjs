// Smoke: the three routes load, the quiz runs end to end with the keyboard-free happy path, nothing errors in
// the console, and no request leaves the site (the footer promises "nothing you answer here leaves your browser").
import { test, expect, PHONE, readPicks, ANSWERS_KEY } from './helpers.mjs';

function watch(page) {
  const errors = [];
  const offsite = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => {
    const u = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(u.hostname) && u.origin !== new URL(page.url() || 'http://x').origin) {
      if (!u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) offsite.push(r.url());
    }
  });
  return { errors, offsite };
}

test('home: the question, the two ways in, and the card count', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your first credit card, in dollars.');
  await expect(page.getByRole('button', { name: 'Find my card' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'See an example result first' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^All 13 cards$/ })).toBeVisible();
  expect(w.errors).toEqual([]);
});

test('the quiz runs to three picks, and only the answers are stored', async ({ page }) => {
  await page.setViewportSize(PHONE);
  const w = watch(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Find my card' }).click();
  await page.getByRole('radio', { name: /I do not have one yet/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('checkbox', { name: /Eating out/ }).click();
  await page.getByRole('checkbox', { name: /Groceries/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /\$500 to \$1,000/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /^No/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio', { name: /The most money back/ }).click();
  await page.getByRole('button', { name: 'Show my three cards' }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Three cards that fit, best first.');
  expect(await readPicks(page)).toHaveLength(3);
  const stored = await page.evaluate(() => ({ ...sessionStorage }));
  expect(Object.keys(stored)).toEqual([ANSWERS_KEY]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(w.errors).toEqual([]);
  expect(w.offsite).toEqual([]);
});

test('every apply link goes straight to the bank, with no tracking', async ({ page }) => {
  await page.goto('/results?example=1');
  const links = page.getByRole('link', { name: /^See this card at / });
  expect(await links.count()).toBe(3);
  for (const href of await links.evaluateAll(as => as.map(a => a.href))) {
    const u = new URL(href);
    expect(u.protocol).toBe('https:');
    expect(u.hostname).toMatch(/(discover|capitalone|chase|citi|bankofamerica|americanexpress)\.com$/);
    expect(u.search, href).toBe('');
  }
});

test('results with no answers explain themselves', async ({ page }) => {
  await page.goto('/results');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No answers yet');
  await expect(page.getByRole('link', { name: 'Answer the five questions' })).toBeVisible();
});

test('the cards page lists 13 cards and the 4 left out', async ({ page }) => {
  const w = watch(page);
  await page.goto('/cards');
  await expect(page.getByText('13 cards', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 })).toHaveCount(17);
  await page.getByRole('button', { name: 'Student cards' }).click();
  await expect(page.getByRole('button', { name: 'Student cards' })).toHaveAttribute('aria-pressed', 'true');
  expect(w.errors).toEqual([]);
});
