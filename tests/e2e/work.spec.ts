import { test, expect } from '@playwright/test';

/**
 * Sample test — a starting point, not coverage.
 * `baseURL` is the project root (see playwright.config.ts), so relative paths
 * resolve against the site on disk.
 */

test.describe('Work History Page Tests', () => {
  test('Verify Header is Visible', async ({ page }) => {
    await page.goto('./website/work.html');

    await expect(page).toHaveTitle(/Roi Mark Gamba/);
    await expect(page.getByRole('heading', { name: 'ROI MARK GAMBA' })).toBeVisible();
  });
})
