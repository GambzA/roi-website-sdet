import { test, expect } from '@playwright/test';

/**
 * Sample test — a starting point, not coverage.
 * `baseURL` is the project root (see playwright.config.ts), so relative paths
 * resolve against the site on disk.
 */

test.describe('Home Page Tests', () => {
  test('Verify Page Loads', async ({ page }) => {
    await page.goto('./website/index.html');

    await expect(page).toHaveTitle(/Roi Mark Gamba/);
    await expect(page.getByRole('heading', { name: 'ROI GAMBA' })).toBeVisible();
  });

  test('Verify Page Loads 2', async ({ page }) => {
    await page.goto('./website/index.html');

    await expect(page).toHaveTitle(/Roi Mark Gamba/);
    await expect(page.getByRole('heading', { name: 'ROI GAMBA' })).toBeVisible();
  });
})
