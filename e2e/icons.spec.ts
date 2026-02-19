/**
 * @file E2E tests for icon gallery - validates all icons render correctly
 */

import { test, expect } from "@playwright/test";

test.describe("Icon Gallery", () => {
  test("page loads and all icons render", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      errors.push(`Page error: ${err.message}`);
    });

    await page.goto("/#/dev/icon-gallery");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Log any errors for debugging
    if (errors.length > 0) {
      console.log("Console errors:", errors);
    }

    // Check page title exists
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible({ timeout: 10000 });
    await expect(h1).toHaveText("Icon Gallery");

    // Check icons rendered
    const iconContainers = page.locator("[data-icon]");
    const count = await iconContainers.count();
    expect(count).toBeGreaterThan(0);

    // Check each icon has an SVG
    for (let i = 0; i < count; i++) {
      const container = iconContainers.nth(i);
      const iconName = await container.getAttribute("data-icon");
      const svg = container.locator("svg");
      await expect(svg, `Icon "${iconName}" should render`).toBeVisible();
    }

    // No errors should have occurred
    expect(errors, "No console errors should occur").toHaveLength(0);
  });

  test("icons have valid structure", async ({ page }) => {
    await page.goto("/#/dev/icon-gallery");
    await page.waitForSelector("[data-icon]", { timeout: 10000 });

    const svgs = page.locator("[data-icon] svg");
    const count = await svgs.count();

    for (let i = 0; i < count; i++) {
      const svg = svgs.nth(i);

      // Check viewBox
      const viewBox = await svg.getAttribute("viewBox");
      expect(viewBox, `SVG ${i} should have viewBox`).toBeTruthy();

      // Check has children
      const children = svg.locator(":scope > *");
      const childCount = await children.count();
      expect(childCount, `SVG ${i} should have children`).toBeGreaterThan(0);

      // Check visible size
      const box = await svg.boundingBox();
      expect(box?.width, `SVG ${i} should have width`).toBeGreaterThan(0);
      expect(box?.height, `SVG ${i} should have height`).toBeGreaterThan(0);
    }
  });
});
