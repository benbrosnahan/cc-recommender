// Shared helpers for the Card Picker suite. Each test gets a fresh browser context, so storage starts empty.
import { test, expect } from '@playwright/test';

export { test, expect };

export const PHONE = { width: 375, height: 812 };
export const DESKTOP = { width: 1440, height: 900 };
export const ANSWERS_KEY = 'cc-answers';

/**
 * Marks a test as a known issue from audits/REPORT.md. The test asserts the fixed behaviour, so today it fails
 * and Playwright counts that as expected. Once the issue is fixed, Playwright reports "expected to fail, but
 * passed": delete the knownIssue() call and mark the issue fixed in REPORT.md. AUDIT_SHOW_KNOWN=1 runs known
 * issues as ordinary tests, which shows the real failure.
 */
export function knownIssue(id) {
  test.info().annotations.push({ type: 'issue', description: id });
  test.fail(!process.env.AUDIT_SHOW_KNOWN, `Known issue ${id}: see audits/REPORT.md`);
}

/** Opens /results for a set of quiz answers, the way the quiz hands them over: through session storage. */
export async function openResults(page, answers) {
  await page.addInitScript(([key, value]) => sessionStorage.setItem(key, value), [ANSWERS_KEY, JSON.stringify(answers)]);
  await page.goto('/results');
  await page.getByRole('heading', { level: 1 }).waitFor();
}

/** Drops the bank's legal marks, as the comparison list does. */
export const shortName = name => name.replace(/[®℠™]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Reads the three picks from "All three, on one scale": each row's card name, year-one dollars and every-year
 * dollars, in the order shown. With a single pick there is no comparison, so the pick card is read instead.
 */
export async function readPicks(page) {
  const rows = page.locator('ol > li');
  const n = await rows.count();
  const picks = [];
  for (let i = 0; i < n; i++) {
    const text = (await rows.nth(i).innerText()).replace(/\s+/g, ' ');
    const m = text.match(/^(.*?) \$([\d,]+) in year one, then \$([\d,]+) a year/);
    if (!m) throw new Error(`Could not read pick row: ${text}`);
    picks.push({ name: m[1], yearOne: Number(m[2].replace(/,/g, '')), later: Number(m[3].replace(/,/g, '')) });
  }
  return picks;
}
