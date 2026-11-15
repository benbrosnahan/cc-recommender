// Security headers: the response headers behind "nothing you answer here leaves your browser".
import { test, expect } from './helpers.mjs';

for (const path of ['/', '/results', '/cards']) {
  test(`headers on ${path}`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const h = res.headers();
    const csp = h['content-security-policy'] ?? '';
    expect(csp, 'Content-Security-Policy').toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['x-powered-by']).toBeUndefined();
  });
}

test('the content security policy does not break the page', async ({ page }) => {
  const blocked = [];
  page.on('console', m => { if (/Content Security Policy/i.test(m.text())) blocked.push(m.text()); });
  await page.goto('/results?example=1');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/cards');
  expect(blocked).toEqual([]);
});
