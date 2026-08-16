/* Published snapshot — this is what the deployed site lists and replays,
   since a static host runs no runner. Refresh with:
     node tools/publish-runs.js
   Committed on purpose; content/runs.js beside it is local-only. */
window.TESTS = {
  "suites": [
    {
      "key": "home",
      "file": "e2e/home.spec.ts",
      "label": "Home Page Tests",
      "tests": 2
    }
  ],
  "runs": {
    "home": {
      "at": "2026-08-16T17:31:30.736Z",
      "code": 0,
      "ms": 1649,
      "lines": [
        {
          "text": "",
          "tone": "text-fg",
          "ms": 448
        },
        {
          "text": "Running 2 tests using 2 workers",
          "tone": "text-fg",
          "ms": 449
        },
        {
          "text": "",
          "tone": "text-fg",
          "ms": 449
        },
        {
          "text": "  ✓  1 [chromium] › e2e/home.spec.ts:17:7 › Home Page Tests › Verify Page Loads 2 (713ms)",
          "tone": "text-mint",
          "ms": 1604
        },
        {
          "text": "  ✓  2 [chromium] › e2e/home.spec.ts:10:7 › Home Page Tests › Verify Page Loads (718ms)",
          "tone": "text-mint",
          "ms": 1610
        },
        {
          "text": "",
          "tone": "text-fg",
          "ms": 1640
        },
        {
          "text": "  2 passed (1.2s)",
          "tone": "text-mint",
          "ms": 1640
        }
      ],
      "steps": [
        {
          "phase": "begin",
          "title": "Navigate to \"./website/index.html\"",
          "category": "pw:api",
          "line": 18,
          "error": null,
          "ms": 978
        },
        {
          "phase": "begin",
          "title": "Navigate to \"./website/index.html\"",
          "category": "pw:api",
          "line": 11,
          "error": null,
          "ms": 980
        },
        {
          "phase": "end",
          "title": "Navigate to \"./website/index.html\"",
          "category": "pw:api",
          "line": 18,
          "error": null,
          "ms": 1327
        },
        {
          "phase": "begin",
          "title": "Expect \"toHaveTitle\"",
          "category": "expect",
          "line": 20,
          "error": null,
          "ms": 1327
        },
        {
          "phase": "end",
          "title": "Navigate to \"./website/index.html\"",
          "category": "pw:api",
          "line": 11,
          "error": null,
          "ms": 1327
        },
        {
          "phase": "begin",
          "title": "Expect \"toHaveTitle\"",
          "category": "expect",
          "line": 13,
          "error": null,
          "ms": 1327
        },
        {
          "phase": "end",
          "title": "Expect \"toHaveTitle\"",
          "category": "expect",
          "line": 20,
          "error": null,
          "ms": 1367
        },
        {
          "phase": "begin",
          "title": "Expect \"toBeVisible\" getByRole('heading', { name: 'ROI GAMBA' })",
          "category": "expect",
          "line": 21,
          "error": null,
          "ms": 1371
        },
        {
          "phase": "end",
          "title": "Expect \"toBeVisible\" getByRole('heading', { name: 'ROI GAMBA' })",
          "category": "expect",
          "line": 21,
          "error": null,
          "ms": 1378
        },
        {
          "phase": "end",
          "title": "Expect \"toHaveTitle\"",
          "category": "expect",
          "line": 13,
          "error": null,
          "ms": 1382
        },
        {
          "phase": "begin",
          "title": "Expect \"toBeVisible\" getByRole('heading', { name: 'ROI GAMBA' })",
          "category": "expect",
          "line": 14,
          "error": null,
          "ms": 1384
        },
        {
          "phase": "end",
          "title": "Expect \"toBeVisible\" getByRole('heading', { name: 'ROI GAMBA' })",
          "category": "expect",
          "line": 14,
          "error": null,
          "ms": 1392
        }
      ],
      "spec": {
        "file": "e2e/home.spec.ts",
        "lines": [
          "import { test, expect } from '@playwright/test';",
          "",
          "/**",
          " * Sample test — a starting point, not coverage.",
          " * `baseURL` is the project root (see playwright.config.ts), so relative paths",
          " * resolve against the site on disk.",
          " */",
          "",
          "test.describe('Home Page Tests', () => {",
          "  test('Verify Page Loads', async ({ page }) => {",
          "    await page.goto('./website/index.html');",
          "",
          "    await expect(page).toHaveTitle(/Roi Mark Gamba/);",
          "    await expect(page.getByRole('heading', { name: 'ROI GAMBA' })).toBeVisible();",
          "  });",
          "",
          "  test('Verify Page Loads 2', async ({ page }) => {",
          "    await page.goto('./website/index.html');",
          "",
          "    await expect(page).toHaveTitle(/Roi Mark Gamba/);",
          "    await expect(page.getByRole('heading', { name: 'ROI GAMBA' })).toBeVisible();",
          "  });",
          "})",
          ""
        ]
      }
    }
  }
};
