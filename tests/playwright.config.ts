import { defineConfig, devices } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

/**
 * The site is static with no build step, so tests load it straight off disk
 * over file:// — nothing to start, works offline. `baseURL` points at the
 * project root (one level up from this config), which lets specs navigate
 * with a relative path: page.goto('index.html').
 *
 * If the site ever needs a real origin (service workers, fetch, history
 * routing, CORS), swap the file:// baseURL for a server:
 *
 *   use:       { baseURL: 'http://localhost:4173' },
 *   webServer: { command: 'npx --yes http-server .. -p 4173 --silent',
 *                url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
 */
const siteRoot = pathToFileURL(path.resolve(__dirname, '..') + path.sep).href;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: siteRoot,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },

    /* The CRT effects lean on SVG filters and blend modes, which are worth
       checking cross-browser. Run `npx playwright install firefox webkit`
       first, then uncomment:

    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
    { name: 'mobile',  use: { ...devices['iPhone 13'] } },
    */
  ],
});
