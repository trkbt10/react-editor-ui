/**
 * @file Theme Selector E2E tests
 * Tests for theme switching functionality
 * Note: App uses HashRouter, so URLs are hash-based (e.g., /#/path)
 */

import { test, expect } from "@playwright/test";

test.describe("Theme Selector", () => {
  test("should display theme selector in sidebar footer", async ({ page }) => {
    await page.goto("/#/");

    // ThemeSelector uses custom Select which is button role="combobox"
    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await expect(themeSelector).toBeVisible();
  });

  test("should have Light theme selected by default", async ({ page }) => {
    await page.goto("/#/");

    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await expect(themeSelector).toContainText("Light");
  });

  test("should switch to dark theme", async ({ page }) => {
    await page.goto("/#/");

    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await themeSelector.click();

    // Click on Dark option
    await page.locator("div[role='option']", { hasText: "Dark" }).click();

    await expect(themeSelector).toContainText("Dark");
  });

  test("should switch to high contrast theme", async ({ page }) => {
    await page.goto("/#/");

    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await themeSelector.click();

    // Click on High Contrast option
    await page.locator("div[role='option']", { hasText: "High Contrast" }).click();

    await expect(themeSelector).toContainText("High Contrast");
  });

  test("should persist theme across navigation", async ({ page }) => {
    await page.goto("/#/");

    // Switch to dark theme
    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await themeSelector.click();
    await page.locator("div[role='option']", { hasText: "Dark" }).click();

    // Navigate to a component page
    const primitivesCategory = page.locator("summary", {
      hasText: "Primitives",
    });
    await primitivesCategory.click();
    // Use exact matching to avoid "IconButton" match
    await page.locator("a").filter({ hasText: /^Button$/ }).click();

    // Theme selector should still show dark
    await expect(themeSelector).toContainText("Dark");
  });

  test("should apply theme CSS variables", async ({ page }) => {
    await page.goto("/#/components/primitives/button");

    // Switch to dark theme
    const themeSelector = page.locator("button[aria-label='Select component theme']");
    await themeSelector.click();
    await page.locator("div[role='option']", { hasText: "Dark" }).click();

    // Wait for theme to apply
    await page.waitForTimeout(100);

    // Check that CSS variables are applied
    const colorSurface = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue("--rei-color-surface").trim();
    });

    // Dark theme should have dark surface color (e.g., #1e1f24)
    expect(colorSurface).toBeTruthy();
    expect(colorSurface).not.toBe("#ffffff");
  });
});
