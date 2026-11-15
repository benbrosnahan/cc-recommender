// Full-page screenshots of every Card Picker screen at phone (375x812) and desktop (1440x900) widths, for the
// before and after comparison in audits/screenshots/. Read-only: it only loads pages and clicks quiz answers.
// Usage: node screenshots.mjs --url http://localhost:3204 --out screenshots/after [--only home,results]
//        node screenshots.mjs --url https://cense-loan-desk.vercel.app --out screenshots/reference/loan-desk --only page
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const { values } = parseArgs({ options: { url: { type: 'string' }, out: { type: 'string' }, only: { type: 'string' } } });
if (!values.url || !values.out) {
  console.error('Usage: node screenshots.mjs --url <base url> --out <folder> [--only a,b]');
  process.exit(2);
}
const base = values.url.replace(/\/$/, '');
const out = path.resolve(values.out);
mkdirSync(out, { recursive: true });

const VIEWPORTS = { phone: { width: 375, height: 812 }, desktop: { width: 1440, height: 900 } };
const PROFILE_B = {
  creditTier: 'good',
  spendingCategories: ['online_shopping', 'dining', 'groceries'],
  spendBucket: '1000_2000',
  travelIntent: 'yes',
  priority: 'maximize_cash',
};

const SHOTS = {
  // Any site's first screen, for the reference apps.
  page: async page => page.goto(`${base}/`),
  home: async page => page.goto(`${base}/`),
  'quiz-1': async page => {
    await page.goto(`${base}/`);
    await page.getByRole('button', { name: 'Find my card' }).click();
  },
  'quiz-2': async page => {
    await page.goto(`${base}/`);
    await page.getByRole('button', { name: 'Find my card' }).click();
    await page.getByRole('radio', { name: /I do not have one yet/ }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('checkbox', { name: /Eating out/ }).click();
    await page.getByRole('checkbox', { name: /Groceries/ }).click();
  },
  'results-example': async page => page.goto(`${base}/results?example=1`),
  'results-profile-b': async page => {
    await page.addInitScript(v => sessionStorage.setItem('cc-answers', v), JSON.stringify(PROFILE_B));
    await page.goto(`${base}/results`);
  },
  'results-empty': async page => page.goto(`${base}/results`),
  cards: async page => page.goto(`${base}/cards`),
};

const only = values.only ? values.only.split(',') : Object.keys(SHOTS).filter(k => k !== 'page');
const browser = await chromium.launch({ headless: true });
for (const name of only) {
  for (const [vp, size] of Object.entries(VIEWPORTS)) {
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    try {
      await SHOTS[name](page);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(900);
      const file = path.join(out, `${name}-${vp}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(file);
    } catch (err) {
      console.error(`${name}-${vp}: ${err.message.split('\n')[0]}`);
    }
    await context.close();
  }
}
await browser.close();
