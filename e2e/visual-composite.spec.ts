/**
 * @file Visual snapshot tests for composite components
 */

import { test, expect } from "@playwright/test";

test.describe("Visual: Composite", () => {
  test("StrokeSettingsPanel", async ({ page }) => {
    await page.goto("/#/components/composite/stroke-settings-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/stroke-settings-panel.png",
      fullPage: true,
    });
  });

  test("TypographyPanel", async ({ page }) => {
    await page.goto("/#/components/composite/typography-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/typography-panel.png",
      fullPage: true,
    });
  });

  test("FontsPanel", async ({ page }) => {
    await page.goto("/#/components/composite/fonts-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/fonts-panel.png",
      fullPage: true,
    });
  });

  test("PositionPanel", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");
    await page.screenshot({
      path: "e2e/screenshots/position-panel.png",
      fullPage: true,
    });
  });

  test("PositionPanel - no overflow in Position section", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");

    // Find the first Position panel (Complete Panel demo)
    const firstSection = page.locator("text=Complete Panel").locator("..").locator("..");
    const panel = firstSection.locator("div").filter({ has: page.locator("h3:has-text('Position')") }).first();

    // The X and Y inputs in the first panel should be visible and not overflow
    const xInput = page.getByRole("textbox", { name: "X position" }).first();
    const yInput = page.getByRole("textbox", { name: "Y position" }).first();

    await expect(xInput).toBeVisible();
    await expect(yInput).toBeVisible();

    // Get bounding boxes to verify no overflow
    const xBox = await xInput.boundingBox();
    const yBox = await yInput.boundingBox();

    // Both inputs should have reasonable width (not squashed or overflowing)
    if (xBox && yBox) {
      expect(xBox.width).toBeGreaterThan(40);
      expect(yBox.width).toBeGreaterThan(40);
    }
  });

  test("PositionPanel - dropdown renders via portal", async ({ page }) => {
    await page.goto("/#/components/composite/position-panel");
    await page.waitForSelector("h2");

    // Click on the first horizontal constraint dropdown to open it
    const horizontalConstraintSelect = page.getByRole("combobox", { name: "Horizontal constraint" }).first();
    await horizontalConstraintSelect.click();

    // The dropdown should be visible and rendered in body (via portal)
    const dropdown = page.locator("body > [role='listbox']");
    await expect(dropdown).toBeVisible();

    // Dropdown should have options
    const options = dropdown.locator("[role='option']");
    await expect(options).toHaveCount(5); // Left, Right, Left and Right, Center, Scale

    // Take screenshot with dropdown open
    await page.screenshot({
      path: "e2e/screenshots/position-panel-dropdown.png",
      fullPage: true,
    });
  });
});
