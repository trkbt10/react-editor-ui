/**
 * @file Visual snapshot tests for data display components
 */

import { test } from "@playwright/test";

test.describe("Visual: Data Display", () => {
  test("SectionHeader", async ({ page }) => {
    await page.goto("/#/components/data-display/section-header");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/section-header.png",
      fullPage: true,
    });
  });

  test("Select", async ({ page }) => {
    await page.goto("/#/components/data-display/select");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/select.png",
      fullPage: true,
    });
  });

  test("TreeItem", async ({ page }) => {
    await page.goto("/#/components/data-display/tree-item");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/tree-item.png",
      fullPage: true,
    });
  });

  test("LayerItem", async ({ page }) => {
    await page.goto("/#/components/data-display/layer-item");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/layer-item.png",
      fullPage: true,
    });
  });

  test("PropertyRow", async ({ page }) => {
    await page.goto("/#/components/data-display/property-row");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/property-row.png",
      fullPage: true,
    });
  });
});
