// Playwright suite for Card Picker. Runs against a production build on port 3204, started from the repo root
// unless AUDIT_URL points somewhere else (the live site, a preview deployment, another port).
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.AUDIT_PORT || 3204);
const baseURL = process.env.AUDIT_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  workers: process.env.AUDIT_WORKERS ? Number(process.env.AUDIT_WORKERS) : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['json', { outputFile: 'results/latest/playwright.json' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: process.env.AUDIT_URL
    ? undefined
    : {
        command: `npm --prefix .. run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
