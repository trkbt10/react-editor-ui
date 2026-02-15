/**
 * @file Visual snapshot tests for layout components
 */

import { test } from "@playwright/test";

test.describe("Visual: Layout", () => {
  test("PropertyGrid", async ({ page }) => {
    await page.goto("/#/components/layout/property-grid");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/property-grid.png",
      fullPage: true,
    });
  });

  test("PropertySection", async ({ page }) => {
    await page.goto("/#/components/layout/property-section");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/property-section.png",
      fullPage: true,
    });
  });

  test("Panel", async ({ page }) => {
    await page.goto("/#/components/layout/panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/panel.png",
      fullPage: true,
    });
  });
});
