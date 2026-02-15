/**
 * @file Navigation E2E tests
 * Tests for sidebar navigation and page routing
 * Note: App uses HashRouter, so URLs are hash-based (e.g., /#/path)
 */

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should display home page by default", async ({ page }) => {
    await page.goto("/#/");
    // Use more specific heading locator
    await expect(page.locator("h2", { hasText: "React Editor UI" })).toBeVisible();
  });

  test("should navigate to component pages via sidebar", async ({ page }) => {
    await page.goto("/#/");

    // Open Primitives category
    const primitivesCategory = page.locator("summary", {
      hasText: "Primitives",
    });
    await primitivesCategory.click();

    // Navigate to IconButton page
    await page.locator("a", { hasText: "IconButton" }).click();
    await expect(page).toHaveURL(/#\/components\/primitives\/icon-button/);
    await expect(page.locator("h2", { hasText: "IconButton" })).toBeVisible();
  });

  test("should navigate through all categories", async ({ page }) => {
    await page.goto("/#/");

    // Test Primitives
    const primitivesCategory = page.locator("summary", {
      hasText: "Primitives",
    });
    await primitivesCategory.click();
    // Use exact matching with first() to avoid duplicate matches
    await expect(
      page.locator("a").filter({ hasText: /^IconButton$/ }),
    ).toBeVisible();
    await expect(page.locator("a").filter({ hasText: /^Button$/ })).toBeVisible();
    await expect(page.locator("a").filter({ hasText: /^Input$/ })).toBeVisible();
    await expect(page.locator("a").filter({ hasText: /^Badge$/ })).toBeVisible();

    // Test Layout
    const layoutCategory = page.locator("summary", { hasText: "Layout" });
    await layoutCategory.click();
    await expect(page.locator("a", { hasText: "Toolbar" })).toBeVisible();

    // Test Data Display
    const dataDisplayCategory = page.locator("summary", {
      hasText: "Data Display",
    });
    await dataDisplayCategory.click();
    await expect(
      page.locator("a", { hasText: "PropertyRow" }),
    ).toBeVisible();
    await expect(
      page.locator("a", { hasText: "SectionHeader" }),
    ).toBeVisible();
    await expect(page.locator("a", { hasText: "TreeItem" })).toBeVisible();
    await expect(page.locator("a", { hasText: "Select" })).toBeVisible();

    // Test Feedback
    const feedbackCategory = page.locator("summary", { hasText: "Feedback" });
    await feedbackCategory.click();
    await expect(page.locator("a", { hasText: "StatusBar" })).toBeVisible();
    await expect(page.locator("a", { hasText: "LogEntry" })).toBeVisible();
  });

  test("should highlight active link", async ({ page }) => {
    await page.goto("/#/components/primitives/button");

    // The Button link should have the active styling
    const buttonLink = page.locator("a", { hasText: "Button" }).first();
    await expect(buttonLink).toBeVisible();
  });
});
