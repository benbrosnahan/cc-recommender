// Accessibility: axe's WCAG 2.2 A and AA rules on every screen at phone and desktop width, plus the Cense
// floors axe does not check: 13px type, 40px tap targets and 48px primary buttons.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, PHONE, DESKTOP, knownIssue, openResults } from './helpers.mjs';

const SCREENS = {
  home: async page => page.goto('/'),
  'question 1': async page => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Find my card' }).click();
  },
  'question 2': async page => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Find my card' }).click();
    await page.getByRole('radio', { name: /I do not have one yet/ }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  },
  'example result': async page => page.goto('/results?example=1'),
  'result, good credit': async page => openResults(page, {
    creditTier: 'good', spendingCategories: ['online_shopping', 'dining', 'groceries'], spendBucket: '1000_2000', travelIntent: 'yes', priority: 'maximize_cash',
  }),
  cards: async page => page.goto('/cards'),
};

for (const [name, open] of Object.entries(SCREENS)) {
  for (const [vp, size] of [['phone', PHONE], ['desktop', DESKTOP]]) {
    test(`axe: ${name}, ${vp}`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      // Open every disclosure, so the breakdowns and the method are checked too.
      const closed = page.locator('button[aria-expanded="false"]');
      while (await closed.count()) await closed.first().click();
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(violations.map(v => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });

    test(`floors: ${name}, ${vp}`, async ({ page }) => {
      await page.setViewportSize(size);
      await open(page);
      const report = await page.evaluate(() => {
        const out = { small: [], targets: [], primary: [] };
        for (const el of document.querySelectorAll('body *')) {
          const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (!own || !el.getClientRects().length) continue;
          const px = parseFloat(getComputedStyle(el).fontSize);
          if (px < 13) out.small.push(`${el.tagName} ${px}px "${el.textContent.trim().slice(0, 30)}"`);
        }
        for (const el of document.querySelectorAll('a, button, [role="radio"], [role="checkbox"]')) {
          const r = el.getBoundingClientRect();
          if (!r.width) continue;
          // Links inside a sentence are exempt (WCAG 2.5.8 inline exception).
          const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
          if (!inline && r.height < 40) out.targets.push(`${el.tagName} ${Math.round(r.height)}px "${el.textContent.trim().slice(0, 30)}"`);
          if (el.className.includes('bg-navy') && el.className.includes('min-h-[48px]') && r.height < 48) out.primary.push(el.textContent.trim());
        }
        return out;
      });
      expect(report).toEqual({ small: [], targets: [], primary: [] });
    });
  }
}

test('A11Y-01 single-choice questions move with the arrow keys, like native radios', async ({ page }) => {
  knownIssue('A11Y-01');
  await page.goto('/');
  await page.getByRole('button', { name: 'Find my card' }).click();
  const first = page.getByRole('radio', { name: /I do not have one yet/ });
  await first.click();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('radio', { name: /Under 580/ })).toBeFocused();
});
